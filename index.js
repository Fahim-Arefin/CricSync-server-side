const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./model/user");
const Team = require("./model/team");
const Match = require("./model/match");

//connection with mongoose
// -------------------------------------------------------------------------------------------------------------------
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8wioxsd.mongodb.net/CricSync?retryWrites=true&w=majority`
  ) //connected to farmStand database
  .then(() => {
    console.log("Mongo connnection successful: ");
  })
  .catch((e) => {
    console.log("Mongo connection failed !!");
    console.log(e);
  });

// -------------------------------------------------------------------------------------------------------------------

//middleware
// -------------------------------------------------------------------------------------------------------------------

app.use(
  cors({
    origin: ["http://localhost:5173"],
    // origin: [
    //   "https://metroshelter-7a7d6.web.app",
    //   "https://metroshelter-7a7d6.firebaseapp.com",
    // ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Varify Token middleware
const varifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access" });
    }
    req.user = decoded;
    next();
  });
};

// -------------------------------------------------------------------------------------------------------------------

// server
// -------------------------------------------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`server started with port ${port}`);
});

// -------------------------------------------------------------------------------------------------------------------

// Route
// -------------------------------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("project is running ...");
});

// Jwt Token Route

// Isuue Token
app.post("/jwt", (req, res) => {
  try {
    const body = req.body;
    // console.log(body);
    const token = jwt.sign(body, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Delete Token
app.post("/logout", (req, res) => {
  try {
    const body = req.body;
    // console.log("logging out user...", body);
    res.clearCookie("token", { maxAge: 0 });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// User Route
// --------------------------------------------------------------------------------------------------------------

// create a user
app.post("/users", async (req, res) => {
  try {
    const body = req.body;
    const user = new User(body);
    const data = await user.save();
    res.status(201).send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get all user
app.get("/users", async (req, res) => {
  try {
    const data = await User.find({});
    res.send(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
// get a user based on email
app.get("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = await User.findOne({ email });
    res.send(data);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// get a user based on id
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.send({ msg: "User Deleted SuccessFully" });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// --------------------------------------------------------------------------------------------------------------

// Team Route
// --------------------------------------------------------------------------------------------------------------
// create a team
app.post("/teams/new", async (req, res) => {
  try {
    const { author, name, players } = req.body;

    // Create a new team instance
    const newTeam = new Team({
      author,
      name,
      players,
    });

    // Save the team to the database
    const savedTeam = await newTeam.save();

    res.status(201).json(savedTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).send("Internal Server Error");
  }
});

// get all team
app.get("/teams", async (req, res) => {
  try {
    const data = await Team.find({});
    res.send(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

// Match Route
// --------------------------------------------------------------------------------------------------------------
// create a Match
app.post("/matches/new", async (req, res) => {
  try {
    const body = req.body;
    const newMatch = new Match(body);
    const savedMatch = await newMatch.save();

    res.status(201).json(savedMatch);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update a Match
app.patch("/matches/score/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const match = await Match.findById(id);
    // console.log(body);
    let team;
    if (body.battingTeam === match.team1.name) {
      team = "team1";
    } else {
      team = "team2";
    }

    if (team === "team1") {
      if (
        match.team1.ballPlayed === parseInt(match.overs) * 6 ||
        match.team1.totalWicket === 10
      ) {
        console.log("Finished....");
        res.send({ msg: "team1" });
        return;
      }
      match.team1.ballPlayed = parseInt(match.team1.ballPlayed) + 1;
      for (let player of match.team1.players) {
        if (player._id == body.batsman) {
          if (player.isOut) {
            res.send({ invalid: "already out" });
            return;
          }
          if (parseInt(body.runPerBall) === 6) {
            player.sixes = parseInt(player.sixes) + 1;
          }
          if (parseInt(body.runPerBall) === 4) {
            player.fours = parseInt(player.fours) + 1;
          }

          player.runs = parseInt(player.runs) + parseInt(body.runPerBall);
          player.balls = parseInt(player.balls) + 1;

          // sum total
          match.team1.totalScore =
            parseInt(body.runPerBall) + match.team1.totalScore;
        }
      }
    } else {
      if (
        match.team2.ballPlayed === parseInt(match.overs) * 6 ||
        match.team2.totalWicket === 10
      ) {
        console.log("Finished....");
        res.send({ msg: "team2" });
        return;
      }
      match.team2.ballPlayed = parseInt(match.team2.ballPlayed) + 1;
      for (let player of match.team2.players) {
        if (player._id == body.batsman) {
          if (player.isOut) {
            res.send({ invalid: "already out" });
            return;
          }
          if (parseInt(body.runPerBall) === 6) {
            player.sixes = parseInt(player.sixes) + 1;
          }
          if (parseInt(body.runPerBall) === 4) {
            player.fours = parseInt(player.fours) + 1;
          }
          player.runs = parseInt(player.runs) + parseInt(body.runPerBall);
          player.balls = parseInt(player.balls) + 1;
          // sum total
          match.team2.totalScore =
            parseInt(body.runPerBall) + match.team2.totalScore;
        }
      }
    }

    const savedMatch = await match.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update a Match out
app.patch("/matches/out/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const match = await Match.findById(id);
    // console.log(body);
    let team;
    if (body.battingTeam === match.team1.name) {
      team = "team1";
    } else {
      team = "team2";
    }

    if (team === "team1") {
      if (
        match.team1.ballPlayed === parseInt(match.overs) * 6 ||
        match.team1.totalWicket === 10
      ) {
        console.log("Finished....");
        res.send({ msg: "finished" });
        return;
      }
      for (let player of match.team1.players) {
        if (player._id == body.batsman) {
          if (player.isOut) {
            res.send({ msg: "team1" });
            return;
          }
          player.isOut = true;
          // sum wicket
          match.team1.totalWicket = match.team1.totalWicket + 1;
          match.team1.ballPlayed = match.team1.ballPlayed + 1;
        }
      }
    } else {
      if (
        match.team2.ballPlayed === parseInt(match.overs) * 6 ||
        match.team2.totalWicket === 10
      ) {
        console.log("Finished....");
        res.send({ msg: "finished" });
        return;
      }
      for (let player of match.team2.players) {
        if (player._id == body.batsman) {
          if (player.isOut) {
            res.send({ msg: "team2" });
            return;
          }
          player.isOut = true;
          // sum wicket
          match.team2.totalWicket = match.team2.totalWicket + 1;
          match.team2.ballPlayed = match.team2.ballPlayed + 1;
        }
      }
    }

    const savedMatch = await match.save();
    res.status(201).json(savedMatch);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).send("Internal Server Error");
  }
});

// get all matches
app.get("/matches", async (req, res) => {
  try {
    const data = await Match.find({});
    res.send(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});
// get a matches
app.get("/matches/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Match.findById(id);
    res.send(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

// get my matches
app.get("/matches/my/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const data = await Match.find({ author: email });
    res.send(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

// reset match
app.post("/matches/reset/:matchId", async (req, res) => {
  try {
    const matchId = req.params.matchId;

    // Fetch the match by its ID
    const match = await Match.findById(matchId);

    // Check if the match exists
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Reset match values to their default state
    match.team1.players.forEach((player) => {
      player.runs = 0;
      player.balls = 0;
      player.fours = 0;
      player.sixes = 0;
      player.isOut = false;
    });

    match.team2.players.forEach((player) => {
      player.runs = 0;
      player.balls = 0;
      player.fours = 0;
      player.sixes = 0;
      player.isOut = false;
    });

    match.team1.ballPlayed = 0;
    match.team1.totalScore = 0;

    match.team2.ballPlayed = 0;
    match.team2.totalWicket = 0;

    const savedData = await match.save();

    return res.status(200).json(savedData);
  } catch (error) {
    console.error("Error resetting match values:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
