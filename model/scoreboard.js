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

const matchSchema = new mongoose.Schema({
  teams: [
    {
      name: {
        type: String,
        required: true,
      },
      players: [playerSchema],
    },
  ],
  overs: {
    type: Number,
    required: true,
  },
  currentOver: {
    type: Number,
    default: 0,
  },
});

const Scoreboard = mongoose.model("Scoreboard", matchSchema);

module.exports = Scoreboard;
