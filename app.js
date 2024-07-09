const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "wawfef32j4hfhjsdfjrrdfojwer43253452435";

const mongourl = "mongodb+srv://aryan1:aryan@cluster0.klgngmp.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongourl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.error("MongoDB connection error:", e);
  });

require("./userDetails");

const User = mongoose.model("UserInfo");

// Signup route
app.post("/register", async (req, res) => {
  const { fname, lname, email, password, dob } = req.body;

  try {
    if (!fname || !lname || !email || !password || !dob) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const user = new User({
      fname,
      lname,
      email,
      password: await bcrypt.hash(password, 10),
      dob
    });

    await user.save();

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Error saving user to database" });
  }
});

// Login route
app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ error: "User Not Found " });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);

    if (res.status(201)) {
      return res.json({ status: "ok", data: { userData: user, token } });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});

// User data route
app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decodedToken);
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return res.send({ status: "error", error: "User not found" });
    }
    res.send({ status: "ok", data: user });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.send({ status: "error", error: "Internal Server Error" });
  }
});

app.listen(5000, () => {
  console.log("Server Started");
});
