const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const auth = require('../middleware/auth');
const User = require('../models/user');
const UserProfile = require('../models/userProfile');
const path = require('path');
const fs = require('fs').promises;
const { resolveResumeDownloadUrl } = require('../utils/resumeResolver');
const { extractPdfTextFromUrl } = require('../utils/pdfExtractor');

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter: PDF only
const fileFilter = (req, file, cb) => {
  const allowedType = 'application/pdf';
  if (file.mimetype === allowedType) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Wrap multer to surface friendly errors (type/size)
const handleUploadSingle = (req, res, next) => {
  upload.single('resume')(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max 5MB allowed.' });
      }
      return res.status(400).json({ error: err.message || 'Invalid file upload.' });
    }
    next();
  });
};

// Upload resume endpoint
router.post('/upload', auth, handleUploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resumes',
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true
    });

    // Delete temporary file
    await fs.unlink(req.file.path);

    // Update user with resume URL (legacy top-level fields)
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If there's an existing resume, delete it from Cloudinary
    if (user.resumeUrl && user.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(user.resumePublicId, { resource_type: 'raw' });
      } catch (error) {
        console.error('Error deleting old resume:', error);
      }
    }

    // Update user profile
    user.resumeUrl = result.secure_url;
    user.resumePublicId = result.public_id;
    await user.save();

    // Also persist resume metadata into structured UserProfile
    let profile = await UserProfile.findOne({ userId });
    if (!profile) {
      profile = new UserProfile({ userId });
    }
    const now = new Date();
    profile.resume = {
      ...(profile.resume?.toObject ? profile.resume.toObject() : profile.resume || {}),
      fileUrl: result.secure_url,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadDate: now,
    };
    profile.sectionsCompleted = profile.sectionsCompleted || {};
    profile.sectionsCompleted.resume = true;
    await profile.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        resumeUrl: result.secure_url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadDate: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up temporary file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }

    const msg = error?.http_code === 400 && /Invalid file|resource_type/.test(error?.message || '')
      ? 'Unsupported file type. Please upload a valid PDF file.'
      : (error?.message || 'Failed to upload resume');
    res.status(500).json({ error: 'Failed to upload resume', message: msg });
  }
});

// Get current user's resume
router.get('/current', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [user, profile] = await Promise.all([
      User.findById(userId).select('resumeUrl'),
      UserProfile.findOne({ userId }).select('resume')
    ]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const rv = profile?.resume || {};
    res.json({
      success: true,
      data: {
        resumeUrl: rv.fileUrl || user.resumeUrl || null,
        fileName: rv.fileName || null,
        fileSize: rv.fileSize || null,
        uploadDate: rv.uploadDate || null,
      }
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ error: 'Failed to fetch resume information' });
  }
});

// Delete resume
router.delete('/delete', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.resumeUrl && user.resumePublicId) {
      // Delete from Cloudinary
      await cloudinary.uploader.destroy(user.resumePublicId, { resource_type: 'raw' });

      // Update user profile
      user.resumeUrl = undefined;
      user.resumePublicId = undefined;
      await user.save();
    }

    // Also clear resume metadata from UserProfile
    const profile = await UserProfile.findOne({ userId });
    if (profile) {
      profile.resume = { fileUrl: '', fileName: '', fileSize: 0, uploadDate: undefined };
      profile.sectionsCompleted = profile.sectionsCompleted || {};
      profile.sectionsCompleted.resume = false;
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Simple in-memory cache for recently extracted resume text to speed UX
const resumeTextCache = new Map(); // key: userId -> { text, expires }

// Extract text from the current user's stored resume
router.get('/extract-current', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    // Serve from cache if fresh (2 minutes)
    const cached = resumeTextCache.get(userId);
    if (cached && cached.expires > Date.now()) {
      return res.json({ success: true, length: cached.text.length, text: cached.text, cached: true });
    }
    const [user, profile] = await Promise.all([
      User.findById(userId).select('resumeUrl resumePublicId'),
      UserProfile.findOne({ userId }).select('resume.fileUrl')
    ]);

    if (!user && !profile) return res.status(404).json({ error: 'User not found' });

    const absoluteUrl = (profile && profile.resume && profile.resume.fileUrl) || (user && user.resumeUrl) || '';
    const publicId = (user && user.resumePublicId) || '';

    // Always attempt smart resolution: try direct, fall back to signed if 401/403
    const resolved = await resolveResumeDownloadUrl(
      { resumeUrl: absoluteUrl, resumePublicId: publicId },
      { resume: { fileUrl: absoluteUrl, publicId: publicId } },
      { timeoutMs: 8000 }
    );
    let finalUrl = resolved.url || absoluteUrl || '';

    if (!finalUrl) {
      return res.status(400).json({ error: 'No resume found for this user' });
    }

  const text = await extractPdfTextFromUrl(finalUrl, { timeoutMs: 15000 });
    if (!text) {
      return res.status(422).json({ error: 'Could not extract text from resume' });
    }

    // Limit payload size for safety
    const MAX_CHARS = 40000;
    const trimmed = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

  // Cache for 2 minutes to avoid repeated downloads/parsing
  resumeTextCache.set(userId, { text: trimmed, expires: Date.now() + 2 * 60 * 1000 });

  res.json({
      success: true,
      length: trimmed.length,
      text: trimmed
    });
  } catch (error) {
    console.error('Error extracting current resume text:', error);
    res.status(500).json({ error: 'Failed to extract resume text' });
  }
});

module.exports = router;
