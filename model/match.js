// Match.js
const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
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
  // Add more match-related fields as needed
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
