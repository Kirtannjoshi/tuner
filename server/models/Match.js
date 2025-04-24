const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: String,
  points: { type: Number, default: 0 },
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
  matchesLost: { type: Number, default: 0 },
  nrr: { type: Number, default: 0 }
});

const ScoreSchema = new mongoose.Schema({
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  runRate: { type: Number, default: 0 }
});

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  teams: [TeamSchema],
  scores: {
    team1: ScoreSchema,
    team2: ScoreSchema
  },
  date: { type: Date, required: true },
  time: String,
  venue: { type: String, required: true },
  status: {
    type: String,
    enum: ['upcoming', 'live', 'completed'],
    default: 'upcoming'
  },
  result: String,
  highlights: [{
    type: String,
    timestamp: Date,
    description: String
  }],
  manOfTheMatch: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);