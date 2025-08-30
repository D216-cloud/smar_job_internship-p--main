const express = require('express');
const router = express.Router();
const Application = require('../models/application');
const User = require('../models/user');
const UserProfile = require('../models/userProfile');
const authMiddleware = require('../middleware/auth');

// POST /api/applications/apply
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    console.log('Received application data:', req.body);
    const { jobId, companyId, companyName, fullName, email, phone, coverLetter, linkedIn, portfolio, currentCompany, currentPosition, experience, skills, expectedSalary, startDate, resume } = req.body;
    const userId = req.user.userId;
    
    console.log('Extracted data:', { jobId, companyId, companyName, userId });
    console.log('User from token:', req.user);
    
    if (!jobId) {
      console.log('Missing jobId');
      return res.status(400).json({ error: 'Missing jobId' });
    }
    if (!companyName) {
      console.log('Missing companyName');
      return res.status(400).json({ error: 'Missing companyName' });
    }

    // Determine resume to attach: prefer provided resume, else user's stored resume
    let resumeUrl = resume;
    if (!resumeUrl) {
      try {
        const [user, profile] = await Promise.all([
          User.findById(userId).select('resumeUrl'),
          UserProfile.findOne({ userId }).select('resume.fileUrl')
        ]);
        resumeUrl = (profile && profile.resume && profile.resume.fileUrl) || (user && user.resumeUrl) || '';
      } catch (e) {
        console.warn('Error resolving user resume, will enforce resume requirement');
      }
    }
    if (!resumeUrl) {
      return res.status(400).json({ error: 'Resume is required to apply. Please upload your resume first.' });
    }

    // Prevent duplicate applications
    const exists = await Application.findOne({ jobId, userId });
    if (exists) return res.status(409).json({ error: 'Already applied to this job' });

    const application = new Application({
      jobId,
      companyId: companyId || null, // Only set if it's a valid ObjectId
      companyName, // Always required
      userId,
      fullName,
      email,
      phone,
      coverLetter,
      linkedIn,
      portfolio,
      currentCompany,
      currentPosition,
      experience,
      skills,
      expectedSalary,
      startDate,
      resume: resumeUrl,
      appliedAt: new Date()
    });
    
    console.log('Saving application with userId:', userId);
    await application.save();
    console.log('Application saved successfully:', application._id);
    res.status(201).json(application);
  } catch (err) {
    console.error('Application submission error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/user/:userId
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching applications for user:', userId);
    console.log('Request user from token:', req.user);
    
    const applications = await Application.find({ userId })
      .populate('jobId', 'title company location type salary postingType')
      .populate('companyId', 'name')
      .sort({ appliedAt: -1 });
    
    console.log('Found applications:', applications.length);
    console.log('Applications data:', applications);
    
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/user/me - Get applications for current user
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log('Fetching applications for current user:', userId);
    
    const applications = await Application.find({ userId })
      .populate('jobId', 'title company location type salary postingType')
      .populate('companyId', 'name')
      .sort({ appliedAt: -1 });
    
    console.log('Found applications for current user:', applications.length);
    
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications for current user:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/count/:userId
router.get('/count/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Application.countDocuments({ userId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/company/:companyId
router.get('/company/:companyId', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }
    // Authorization: ensure the requester is the company owner
    if (req.user.userId?.toString() !== companyId.toString()) {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view these applications' });
    }
    console.log('Fetching applications for company:', companyId);

    // First, get all jobs posted by this company
    const Job = require('../models/job');
    const companyJobs = await Job.find({ companyId }).select('_id title');
    const jobIds = companyJobs.map(job => job._id);
    
    console.log('Company jobs found:', jobIds.length);

    // Then, get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location type salary postingType status')
      .populate('userId', 'firstName lastName email phone')
      .sort({ appliedAt: -1 });

    console.log('Found applications:', applications.length);

    // Build a map of userId -> resumeUrl from UserProfile for fallback
    const userIds = applications.map(a => a.userId).filter(Boolean).map(u => u._id || u);
    let resumeMap = {};
    if (userIds.length) {
      const UserProfile = require('../models/userProfile');
      const profiles = await UserProfile.find({ userId: { $in: userIds } }).select('userId resume.fileUrl');
      resumeMap = profiles.reduce((acc, p) => {
        const key = (p.userId && p.userId.toString()) || '';
        if (key) acc[key] = (p.resume && p.resume.fileUrl) || '';
        return acc;
      }, {});
    }

    // Defensive: handle missing userId or jobId
    const enhancedApplications = applications.map(app => {
      const applicationData = app.toObject();
      const candidateEmail = applicationData.email || (applicationData.userId?.email || '');
      const candidateName = applicationData.fullName || 
        `${applicationData.userId?.firstName || ''} ${applicationData.userId?.lastName || ''}`.trim();
      const uid = (applicationData.userId && (applicationData.userId._id || applicationData.userId))?.toString?.() || '';
      const fallbackResume = uid ? resumeMap[uid] : '';

      return {
        ...applicationData,
        email: candidateEmail,
        fullName: candidateName,
        resume: applicationData.resume || fallbackResume || null,
        phone: applicationData.phone || applicationData.userId?.phone || '',
        experience: applicationData.experience || '',
        skills: applicationData.skills || '',
        coverLetter: applicationData.coverLetter || '',
        currentCompany: applicationData.currentCompany || '',
        currentPosition: applicationData.currentPosition || '',
        expectedSalary: applicationData.expectedSalary || '',
        status: applicationData.status || 'applied'
      };
    });

    console.log('Enhanced applications data:', enhancedApplications.length);
    res.json(enhancedApplications);
  } catch (err) {
    console.error('Error fetching company applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to check authentication
router.get('/test-auth', authMiddleware, async (req, res) => {
  try {
    console.log('Test auth endpoint - Request user:', req.user);
    res.json({
      message: 'Authentication working',
      user: req.user,
      userId: req.user.userId,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Test auth error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint to check all applications (for debugging)
router.get('/test-all-applications', authMiddleware, async (req, res) => {
  try {
    console.log('Test all applications endpoint');
    const allApplications = await Application.find({})
      .populate('jobId', 'title company location')
      .populate('userId', 'firstName lastName email')
      .sort({ appliedAt: -1 });
    
    console.log('Total applications in database:', allApplications.length);
    
    res.json({
      message: 'All applications retrieved',
      count: allApplications.length,
      applications: allApplications.map(app => ({
        id: app._id,
        jobId: app.jobId?._id,
        jobTitle: app.jobId?.title,
        userId: app.userId?._id,
        userName: app.fullName || `${app.userId?.firstName || ''} ${app.userId?.lastName || ''}`.trim(),
        email: app.email,
        status: app.status,
        appliedAt: app.appliedAt
      }))
    });
  } catch (err) {
    console.error('Test all applications error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/company-jobs/:companyId - Get all applications for jobs posted by company
router.get('/company-jobs/:companyId', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: 'Missing companyId' });
    }
    // Authorization: ensure the requester is the company owner
    if (req.user.userId?.toString() !== companyId.toString()) {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view these applications' });
    }
    console.log('Fetching applications for jobs posted by company:', companyId);
    console.log('Request user from token:', req.user);

    // First, get all jobs posted by this company
    const Job = require('../models/job');
    const companyJobs = await Job.find({ companyId }).select('_id title company location type salary postingType status createdAt');
    const jobIds = companyJobs.map(job => job._id);
    
    console.log('Company jobs found:', companyJobs.length);
    console.log('Job IDs:', jobIds);

    if (jobIds.length === 0) {
      console.log('No jobs found for company, returning empty array');
      return res.json([]);
    }

    // Then, get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location type salary postingType status createdAt')
      .populate('userId', 'firstName lastName email phone')
      .sort({ appliedAt: -1 });

    console.log('Found applications for company jobs:', applications.length);

    // Build a map of userId -> resumeUrl from UserProfile for fallback
    const userIds = applications.map(a => a.userId).filter(Boolean).map(u => u._id || u);
    let resumeMap = {};
    if (userIds.length) {
      const UserProfile = require('../models/userProfile');
      const profiles = await UserProfile.find({ userId: { $in: userIds } }).select('userId resume.fileUrl');
      resumeMap = profiles.reduce((acc, p) => {
        const key = (p.userId && p.userId.toString()) || '';
        if (key) acc[key] = (p.resume && p.resume.fileUrl) || '';
        return acc;
      }, {});
    }

    // Defensive: handle missing userId or jobId
    const enhancedApplications = applications.map(app => {
      const applicationData = app.toObject();
      const candidateEmail = applicationData.email || (applicationData.userId?.email || '');
      const candidateName = applicationData.fullName || 
        `${applicationData.userId?.firstName || ''} ${applicationData.userId?.lastName || ''}`.trim();
      const uid = (applicationData.userId && (applicationData.userId._id || applicationData.userId))?.toString?.() || '';
      const fallbackResume = uid ? resumeMap[uid] : '';

      return {
        ...applicationData,
        email: candidateEmail,
        fullName: candidateName,
        resume: applicationData.resume || fallbackResume || null,
        phone: applicationData.phone || applicationData.userId?.phone || '',
        experience: applicationData.experience || '',
        skills: applicationData.skills || '',
        coverLetter: applicationData.coverLetter || '',
        currentCompany: applicationData.currentCompany || '',
        currentPosition: applicationData.currentPosition || '',
        expectedSalary: applicationData.expectedSalary || '',
        status: applicationData.status || 'applied'
      };
    });

    console.log('Enhanced applications data:', enhancedApplications.length);
    res.json(enhancedApplications);
  } catch (err) {
    console.error('Error fetching company job applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/job/:jobId - Get applications for a specific job
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('Fetching applications for job:', jobId);
    // Authorization: ensure the requester is the company who posted this job
    const Job = require('../models/job');
    const job = await Job.findById(jobId).select('companyId');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!job.companyId || job.companyId.toString() !== req.user.userId?.toString()) {
      return res.status(403).json({ error: 'Forbidden: Not authorized to view these applications' });
    }
    
    const applications = await Application.find({ jobId })
      .populate('jobId', 'title company location type salary postingType status')
      .populate('userId', 'firstName lastName email phone')
      .sort({ appliedAt: -1 });
    
    console.log('Found applications for job:', applications.length);
    
    // Build a map of userId -> resumeUrl from UserProfile for fallback
    const userIds = applications.map(a => a.userId).filter(Boolean).map(u => u._id || u);
    let resumeMap = {};
    if (userIds.length) {
      const UserProfile = require('../models/userProfile');
      const profiles = await UserProfile.find({ userId: { $in: userIds } }).select('userId resume.fileUrl');
      resumeMap = profiles.reduce((acc, p) => {
        const key = (p.userId && p.userId.toString()) || '';
        if (key) acc[key] = (p.resume && p.resume.fileUrl) || '';
        return acc;
      }, {});
    }

    // Enhance the response to include both direct email and user email
    const enhancedApplications = applications.map(app => {
      const applicationData = app.toObject();
      
      // Use email from application if available, otherwise from user
      const candidateEmail = applicationData.email || (applicationData.userId?.email);
      const candidateName = applicationData.fullName || 
        `${applicationData.userId?.firstName || ''} ${applicationData.userId?.lastName || ''}`.trim();
      const uid = (applicationData.userId && (applicationData.userId._id || applicationData.userId))?.toString?.() || '';
      const fallbackResume = uid ? resumeMap[uid] : '';
      
      return {
        ...applicationData,
        email: candidateEmail,
        fullName: candidateName,
        resume: applicationData.resume || fallbackResume || null,
        // Ensure all required fields are present
        phone: applicationData.phone || applicationData.userId?.phone || '',
        experience: applicationData.experience || '',
        skills: applicationData.skills || '',
        coverLetter: applicationData.coverLetter || '',
        currentCompany: applicationData.currentCompany || '',
        currentPosition: applicationData.currentPosition || '',
        expectedSalary: applicationData.expectedSalary || '',
        status: applicationData.status || 'applied'
      };
    });
    
    res.json(enhancedApplications);
  } catch (err) {
    console.error('Error fetching job applications:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/applications/:id/status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Updating application ${id} status to: ${status}`);
    console.log('Request user:', req.user);
    
    const application = await Application.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).populate('jobId', 'title company location type salary');
    
    if (!application) {
      console.log('Application not found:', id);
      return res.status(404).json({ error: 'Application not found' });
    }
    
    console.log('Application updated successfully:', application._id, 'New status:', application.status);
    res.json(application);
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Simple endpoint to check all applications (for debugging)
router.get('/check-all', async (req, res) => {
  try {
    console.log('Checking all applications in database...');
    
    const allApplications = await Application.find({})
      .populate('jobId', 'title company location salary requirements')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    console.log('Total applications found:', allApplications.length);
    
    const simplifiedApplications = allApplications.map(app => ({
      id: app._id,
      candidateName: app.fullName || `${app.userId?.firstName || ''} ${app.userId?.lastName || ''}`.trim() || 'Unknown Candidate',
      email: app.email || app.userId?.email || 'No email',
      jobTitle: app.jobId?.title || 'Unknown Job',
      jobId: app.jobId?._id || 'Unknown',
      status: app.status || 'applied',
      appliedAt: app.appliedAt || app.createdAt,
      companyId: app.companyId,
      // Include all available user information
      phone: app.phone || 'Not provided',
      experience: app.experience || 'Not specified',
      skills: app.skills || 'Not specified',
      coverLetter: app.coverLetter || 'No cover letter',
      currentPosition: app.currentPosition || 'Not specified',
      currentCompany: app.currentCompany || 'Not specified',
      expectedSalary: app.expectedSalary || 'Not specified',
      resume: app.resume || null,
      // Additional user details
      userId: app.userId?._id,
      userFirstName: app.userId?.firstName,
      userLastName: app.userId?.lastName,
      userEmail: app.userId?.email,
      // Job details
      jobLocation: app.jobId?.location,
      jobSalary: app.jobId?.salary,
      jobRequirements: app.jobId?.requirements,
      jobCompany: app.jobId?.company
    }));

    res.json({
      message: 'All applications retrieved',
      totalCount: allApplications.length,
      applications: simplifiedApplications
    });
  } catch (err) {
    console.error('Error checking all applications:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 