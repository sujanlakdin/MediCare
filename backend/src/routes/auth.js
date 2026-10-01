const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");
const { readEmail, readString } = require("../validation");

const router = express.Router();
const tokenOptions = { expiresIn: "7d", issuer: "medicare-api" };

function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
  };
}

function issueToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, { ...tokenOptions, subject: user._id.toString() });
}

router.post("/register", async (req, res) => {
  const fullName = readString(req.body.fullName, "Full name", { maxLength: 120 });
  const email = readEmail(req.body.email);
  const password = readString(req.body.password, "Password", { maxLength: 128 });
  if (password.length < 10) {
    const error = new Error("Password must be at least 10 characters.");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ fullName, email, passwordHash });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
    throw error;
  }
});

router.post("/login", async (req, res) => {
  const email = readEmail(req.body.email);
  const password = readString(req.body.password, "Password", { maxLength: 128 });
  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Email or password is incorrect." });
  }
  res.json({ token: issueToken(user), user: publicUser(user) });
});

router.get("/me", authenticate, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(401).json({ error: "Your account is no longer available." });
  res.json({ user: publicUser(user) });
});

module.exports = router;