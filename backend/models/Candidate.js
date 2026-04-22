const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  resumePath: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Interviewing', 'Hired'],
    default: 'Applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Candidate', candidateSchema);
