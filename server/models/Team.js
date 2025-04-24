const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  matches: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  tied: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  netRunRate: { type: Number, default: 0.0 },
  logo: String,
  color: String,
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);