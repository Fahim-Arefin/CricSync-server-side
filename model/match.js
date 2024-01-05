// Match.js
const mongoose = require("mongoose");
const Team = require("./team");

const matchSchema = new mongoose.Schema({
  author: {
    type: String,
    require: true,
  },
  team1: Team.schema,
  team2: Team.schema,
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
