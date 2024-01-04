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
