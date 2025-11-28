require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Match = require('./models/Match');
const Team = require('./models/Team');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});

// Apply rate limiting to all requests
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10kb' }));

// MongoDB Connection with security options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuner', {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}).then(() => {
  console.log('Connected to MongoDB securely');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Handle app termination
process.on('SIGINT', () => {
  mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

// API Routes
app.get('/api/ipl/matches/upcoming', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'upcoming' })
      .sort({ date: 1, time: 1 })
      .limit(10)
      .select('-__v');
    
    res.set({
      'Cache-Control': 'public, max-age=300',
      'Content-Security-Policy': "default-src 'self'"
    }).json(matches);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ipl/matches/past', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'completed' })
      .sort({ date: -1 })
      .limit(10)
      .select('-__v');

    res.set({
      'Cache-Control': 'public, max-age=300',
      'Content-Security-Policy': "default-src 'self'"
    }).json(matches);
  } catch (error) {
    console.error('Error fetching past matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ipl/matches/live', async (req, res) => {
  try {
    const matches = await Match.find({ status: 'live' })
      .select('-__v');

    res.set({
      'Cache-Control': 'no-cache',
      'Content-Security-Policy': "default-src 'self'"
    }).json(matches);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Points Table Route
app.get('/api/ipl/points-table', async (req, res) => {
  try {
    const teams = await Team.find()
      .sort({ points: -1, netRunRate: -1 })
      .select('-__v');

    res.set({
      'Cache-Control': 'public, max-age=300',
      'Content-Security-Policy': "default-src 'self'"
    }).json(teams);
  } catch (error) {
    console.error('Error fetching points table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start secure server
const server = app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Starting graceful shutdown');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});