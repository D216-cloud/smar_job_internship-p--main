require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Job = require('./models/job');
const connectDB = require('./config/db');
const Company = require('./models/company');

const app = express();
const PORT = process.env.PORT || 5000;

// Sanitize Cloudinary URL if malformed to prevent SDK crashes
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.trim().startsWith('cloudinary://')) {
  console.warn('⚠️ CLOUDINARY_URL is malformed. It must start with "cloudinary://". Ignoring this variable and using individual credentials instead.');
  delete process.env.CLOUDINARY_URL; // Let utils/cloudinary use cloud_name/api_key/api_secret
}

// Verify environment variables are loaded
console.log('🔍 Environment Check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Configured' : '❌ Missing');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Configured' : '❌ Missing');

// Import routes
const resumeAnalysisRoutes = require('./routes/resumeAnalysis');

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
const resumeUploadRoutes = require('./routes/resumeUpload');
app.use('/api/resume', resumeUploadRoutes);

// Use routes
app.use('/api/resume', resumeAnalysisRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Connect to MongoDB Atlas
connectDB().then(() => {
  console.log('✅ Backend server ready to start');
}).catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error.message);
  process.exit(1);
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// User Profile routes
const userProfileRoutes = require('./routes/userProfile');
app.use('/api/user-profile', userProfileRoutes);

// Company Profile routes
const companyProfileRoutes = require('./routes/companyProfile');
app.use('/api/company-profile', companyProfileRoutes);

// AI Matching routes
const aiMatchingRoutes = require('./routes/aiMatching');
app.use('/api/ai-matching', aiMatchingRoutes);

// Resume matcher route (LLM based JSON analysis)
const resumeMatcherRoutes = require('./routes/resumeMatcher');
app.use('/api/resume-matcher', resumeMatcherRoutes);

// Terminal-style log generator (returns plain text logs for AI runs)
const terminalLogRoutes = require('./routes/terminalLog');
app.use('/api/terminal-log', terminalLogRoutes);

// Chat routes
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

// Match results (history)
const matchResultsRoutes = require('./routes/matchResults');
app.use('/api/match-results', matchResultsRoutes);

// Note: Job routes are now handled by /routes/jobs.js

// POST a new company
app.post('/api/companies', async(req, res) => {
    try {
        const company = new Company(req.body);
        await company.save();
        res.status(201).json({ message: 'Company added successfully', company });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Note: Job routes are now handled by /routes/jobs.js

// GET all jobs for user dashboard (admin posted jobs)
app.get('/api/jobs/available', async(req, res) => {
    try {
        const jobs = await Job.find({ postingType: 'job' }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all internships for user dashboard (admin posted internships)
app.get('/api/internships/available', async(req, res) => {
    try {
        const internships = await Job.find({ postingType: 'internship' }).sort({ createdAt: -1 });
        res.json(internships);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all internships (postingType: 'internship')
app.get('/api/internships', async(req, res) => {
    try {
        const internships = await Job.find({ postingType: 'internship' }).sort({ createdAt: -1 });
        res.json(internships);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Migration route: Update existing jobs to have postedBy field
app.post('/api/migrate-jobs', async(req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Update all jobs that don't have postedBy field
        const result = await Job.updateMany({ postedBy: { $exists: false } }, { $set: { postedBy: userId } });

        res.json({
            message: `Updated ${result.modifiedCount} jobs with postedBy: ${userId}`,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a job by ID
app.delete('/api/jobs/:id', async(req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Increment views for a job/internship
app.post('/api/jobs/:id/view', async(req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id, { $inc: { views: 1 } }, { new: true }
        );
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ views: job.views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Increment applications for a job/internship
app.post('/api/jobs/:id/apply', async(req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id, { $inc: { applications: 1 } }, { new: true }
        );
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json({ applications: job.applications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.use('/api/applications', require('./routes/applications'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/test', require('./routes/testAPI'));

// Root health-check endpoint
app.get('/', (req, res) => {
  // Return a friendly plain-text message so visiting the root URL in a browser shows status
  res.send('API is working — api work ker raha hai');
});

// Test endpoint to add sample data
app.post('/api/test/add-sample-data', async (req, res) => {
  try {
    const Job = require('./models/job');
    const Application = require('./models/application');
    const Company = require('./models/company');
    const User = require('./models/user');

    // Create a test company
    const testCompany = new Company({
      name: 'Test Company',
      email: 'test@company.com',
      password: 'password123',
      industry: 'Technology',
      size: '50-100',
      location: 'San Francisco, CA'
    });
    await testCompany.save();

    // Create a test user
    const testUser = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '123-456-7890',
      location: 'New York, NY',
      experience: '5 years',
      skills: 'React, Node.js, MongoDB'
    });
    await testUser.save();

    // Create test jobs
    const testJobs = [
      {
        title: 'Frontend Developer',
        description: 'We are looking for a skilled frontend developer...',
        location: 'San Francisco, CA',
        salary: '$80,000 - $120,000',
        company: 'Test Company',
        companyId: testCompany._id,
        postingType: 'job',
        status: 'active'
      },
      {
        title: 'Backend Engineer',
        description: 'Join our backend team to build scalable APIs...',
        location: 'Remote',
        salary: '$90,000 - $130,000',
        company: 'Test Company',
        companyId: testCompany._id,
        postingType: 'job',
        status: 'active'
      }
    ];

    const savedJobs = [];
    for (const jobData of testJobs) {
      const job = new Job(jobData);
      await job.save();
      savedJobs.push(job);
    }

    // Create test applications
    const testApplications = [
      {
        jobId: savedJobs[0]._id,
        companyId: testCompany._id,
        companyName: 'Test Company',
        userId: testUser._id,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        coverLetter: 'I am excited to apply for this position...',
        experience: '5 years',
        skills: 'React, JavaScript, HTML, CSS',
        status: 'applied'
      },
      {
        jobId: savedJobs[1]._id,
        companyId: testCompany._id,
        companyName: 'Test Company',
        userId: testUser._id,
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        coverLetter: 'I have extensive experience in backend development...',
        experience: '5 years',
        skills: 'Node.js, Express, MongoDB, PostgreSQL',
        status: 'interview'
      }
    ];

    for (const appData of testApplications) {
      const application = new Application(appData);
      await application.save();
    }

    res.json({ 
      message: 'Sample data added successfully',
      companyId: testCompany._id,
      userId: testUser._id,
      jobsCount: savedJobs.length,
      applicationsCount: testApplications.length
    });

  } catch (error) {
    console.error('Error adding sample data:', error);
    res.status(500).json({ error: error.message });
  }
});     

// Start server with retry logic if port is already in use
function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, '0.0.0.0');

  server.on('listening', () => {
    const addr = server.address();
    const usedPort = typeof addr === 'object' ? addr.port : port;
    console.log(`Server running on port ${usedPort}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use.`);
      if (attemptsLeft > 0) {
        const nextPort = Number(port) + 1;
        console.warn(`🔁 Trying next port ${nextPort} (${attemptsLeft - 1} attempts left)...`);
        // Wait a short moment before retrying to avoid tight loop
        setTimeout(() => startServer(nextPort, attemptsLeft - 1), 250);
      } else {
        console.error('❌ All retry attempts exhausted. Please free the port or set a different PORT in .env');
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
}

startServer(PORT, 5);
