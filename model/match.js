// Match.js
const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  author: {
    type: String,
    require: true,
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  overs: {
    type: Number,
    required: true,
  },
  stadium: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
