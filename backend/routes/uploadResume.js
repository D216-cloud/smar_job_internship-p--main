const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const User = require('../models/user');
const mongoose = require('mongoose');

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary config from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST /api/uploadResume
router.post('/uploadResume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'resumes',
        unique_filename: true
      },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });
        // Save to user (simulate userId from req, e.g. req.user.id or hardcode)
        const userId = req.body.userId || '64e1f1b2c2a4e2a1b1c1d1e1'; // Replace with real auth in prod
        await User.findByIdAndUpdate(userId, {
          resumeUrl: result.secure_url,
          resumePublicId: result.public_id
        });
        return res.json({ url: result.secure_url, publicId: result.public_id });
      }
    );
    // Pipe file buffer to Cloudinary
    require('streamifier').createReadStream(req.file.buffer).pipe(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
