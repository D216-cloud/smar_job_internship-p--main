const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const authMiddleware = require('../middleware/auth');

// Get all jobs
router.get('/', async(req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get jobs posted by a specific user
router.get('/user/:userId', async(req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.params.userId });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new job
router.post('/', authMiddleware, async(req, res) => {
    const job = new Job({
        title: req.body.title,
        description: req.body.description,
        company: req.body.company,
        location: req.body.location,
        salary: req.body.salary,
        companyId: req.user.userId, // Always set to the logged-in user's ID
        postingType: req.body.postingType || 'job',
        // ...other fields
    });

    try {
        const newJob = await job.save();
        res.status(201).json(newJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get jobs posted by the logged-in company
router.get('/company/me', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.userId;
        const jobs = await Job.find({ companyId }).select('title createdAt status _id');
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Edit a job (only by the company who posted it)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.userId;
        const job = await Job.findOne({ _id: req.params.id, companyId });
        if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
        Object.assign(job, req.body);
        await job.save();
        res.json(job);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a job (only by the company who posted it)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.userId;
        const job = await Job.findOneAndDelete({ _id: req.params.id, companyId });
        if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Add this route to your jobs router
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Migrate old jobs to set companyId = postedBy if companyId is missing
// Usage: POST /api/jobs/migrate-company-ids (admin only, remove after running)
router.post('/migrate-company-ids', async (req, res) => {
  try {
    const jobsToUpdate = await Job.find({ $or: [ { companyId: { $exists: false } }, { companyId: null } ], postedBy: { $exists: true, $ne: null } });
    let updatedCount = 0;
    for (const job of jobsToUpdate) {
      job.companyId = job.postedBy;
      await job.save();
      updatedCount++;
    }
    res.json({ message: `Migrated ${updatedCount} jobs.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;