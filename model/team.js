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
  balls: {
    type: Number,
    default: 0,
  },
  fours: {
    type: Number,
    default: 0,
  },
  sixes: {
    type: Number,
    default: 0,
  },
  wickets: {
    type: Number,
    default: 0,
  },
  isOut: {
    type: Boolean,
    default: false,
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
  ballPlayed: {
    type: Number,
    default: 0,
  },
  players: [playerSchema],
  totalScore: {
    type: Number,
    default: 0,
  },
  totalWicket: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
