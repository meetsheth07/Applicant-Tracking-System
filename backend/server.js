require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { clerkMiddleware } = require('@clerk/express');

const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidates');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(clerkMiddleware());

// Serve uploaded resumes as static files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api', candidateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler for Multer
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
  }
  if (err.message === 'Only PDF files are allowed.') {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Connect to MongoDB and start server
const rawURI = process.env.MONGO_URI || '';
const mongoURI = rawURI.trim();

console.log('🔄 Attempting to connect to MongoDB...');

mongoose.connect(mongoURI)
  .then((conn) => {
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed! Error:', err.message);
    console.error('⚠️ The server is still running, but database features will not work.');
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});
