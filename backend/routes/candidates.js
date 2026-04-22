const express = require('express');
const { requireAuth } = require('@clerk/express');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const upload = require('../config/multer');
const { analyzeResume } = require('../services/aiService');

const router = express.Router();

// POST /api/apply/:jobId - Public application route with file upload
router.post('/apply/:jobId', upload.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { name, email } = req.body;

    // Validate the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job listing not found.' });
    }

    if (!job.isActive) {
      return res.status(400).json({ error: 'This job listing is no longer accepting applications.' });
    }

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'A PDF resume is required.' });
    }

    // Build the resume URL for serving
    const resumePath = `/uploads/${req.file.filename}`;

    const candidate = await Candidate.create({
      jobId,
      name,
      email,
      resumePath,
    });

    res.status(201).json({ message: 'Application submitted successfully!', candidate });
  } catch (error) {
    // Handle Multer-specific errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.message === 'Only PDF files are allowed.') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// PUT /api/candidates/:candidateId/status - Update candidate status (Protected)
router.put('/candidates/:candidateId/status', requireAuth(), async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status } = req.body;

    const validStatuses = ['Applied', 'Interviewing', 'Hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { status },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate status:', error);
    res.status(500).json({ error: 'Failed to update candidate status.' });
  }
});


// GET /api/candidates/:candidateId/summary - AI Resume Summary (Protected)
router.get('/candidates/:candidateId/summary', requireAuth(), async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    const summary = await analyzeResume(candidate.resumePath);
    res.json({ summary });
  } catch (error) {
    console.error('AI Summary Route Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
