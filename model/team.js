// Team.js
const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  runs: {
    type: Number,
    default: 0,
  },
  wickets: {
    type: Number,
    default: 0,
  },
});

const teamSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  players: [playerSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
