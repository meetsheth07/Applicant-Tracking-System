const express = require('express');
const { requireAuth } = require('@clerk/express');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

const router = express.Router();

// POST /api/jobs - Create a new job listing (Protected)
router.post('/', requireAuth(), async (req, res) => {
  console.log('📬 Received Job Creation Request:', req.body);
  console.log('👤 HR User ID:', req.auth.userId);

  try {
    const { title, description } = req.body;
    const hrId = req.auth.userId;

    if (!title || !description) {
      console.warn('⚠️ Missing title or description');
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    const job = await Job.create({ hrId, title, description });
    console.log('✅ Job created successfully:', job._id);
    res.status(201).json(job);
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({ error: error.message || 'Failed to create job.' });
  }
});

// GET /api/jobs - Get all jobs for the logged-in HR user (Protected)
router.get('/', requireAuth(), async (req, res) => {
  try {
    const hrId = req.auth.userId;
    const jobs = await Job.find({ hrId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
});

// GET /api/jobs/:jobId - Get a single job by ID (Public - for apply page)
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }
    res.json({ title: job.title, description: job.description });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
});

// GET /api/jobs/:jobId/candidates - Fetch all candidates for a job (Protected)
router.get('/:jobId/candidates', requireAuth(), async (req, res) => {
  try {
    const candidates = await Candidate.find({ jobId: req.params.jobId }).sort({ appliedAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates.' });
  }
});

// DELETE /api/jobs/:jobId - Delete a job listing (Protected)
router.delete('/:jobId', requireAuth(), async (req, res) => {
  try {
    const hrId = req.auth.userId;
    const job = await Job.findOneAndDelete({ _id: req.params.jobId, hrId });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or unauthorized.' });
    }

    // Also remove all candidates associated with this job
    await Candidate.deleteMany({ jobId: req.params.jobId });
    res.json({ message: 'Job and associated candidates deleted.' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

module.exports = router;
