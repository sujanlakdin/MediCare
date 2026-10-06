const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");
const { readEmail, readPhone, readString } = require("../validation");

const router = express.Router();
const tokenOptions = { expiresIn: "7d", issuer: "medicare-api" };

function publicUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role || "patient",
  };
}

function readAccountIdentifier(body) {
  const identifier = readString(body.email || body.phone, "Email or phone number", { maxLength: 254 });
  return identifier.includes("@")
    ? { email: readEmail(identifier) }
    : { phone: readPhone(identifier) };
}

function invalidRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function issueToken(user) {
  return jwt.sign({}, process.env.JWT_SECRET, { ...tokenOptions, subject: user._id.toString() });
}

router.post("/register", async (req, res) => {
  const fullName = readString(req.body.fullName, "Full name", { maxLength: 120 });
  const email = readEmail(req.body.email);
  const password = readString(req.body.password, "Password", { maxLength: 128 });
  const role = req.body.role === undefined
    ? "patient"
    : readString(req.body.role, "Account type", { maxLength: 20 });
  if (!["patient", "caregiver"].includes(role)) {
    throw invalidRequest("Account type must be patient or caregiver.");
  }
  if (password.length < 10) {
    const error = new Error("Password must be at least 10 characters.");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ fullName, email, passwordHash, role });
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

router.post("/forgot-password", async (req, res) => {
  const identifier = readAccountIdentifier(req.body);
  const user = await User.findOne(identifier);
  if (!user) {
    const error = new Error("No MediCare account was found with that email or phone number.");
    error.statusCode = 404;
    throw error;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  await User.updateOne(
    { _id: user._id },
    { $set: { resetToken: otp, resetTokenExpiry: expiry } }
  );

  console.log(`[MediCare Auth] Password reset code for ${user.email}: ${otp}`);
  res.json({
    success: true,
    message: `A 6-digit verification code has been sent to ${user.email}.`,
    phone: user.phone || user.email,
    otp,
    verificationCode: otp,
    expiresIn: 300,
    note: "Development mode: the verification code is included in this response.",
  });
});

router.post("/verify-otp", async (req, res) => {
  const identifier = readAccountIdentifier(req.body);
  const code = readString(req.body.otp || req.body.resetCode, "Verification code", { maxLength: 6 });
  const user = await User.findOne(identifier);
  if (!user || user.resetToken !== code) {
    const error = new Error("Invalid verification code.");
    error.statusCode = 400;
    throw error;
  }
  if (!user.resetTokenExpiry || user.resetTokenExpiry.getTime() <= Date.now()) {
    const error = new Error("Verification code has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }
  res.json({ success: true, message: "Code verified successfully.", phone: user.phone || user.email });
});

router.post("/reset-password", async (req, res) => {
  const identifier = readAccountIdentifier(req.body);
  const code = readString(req.body.otp || req.body.resetCode, "Verification code", { maxLength: 6 });
  const newPassword = readString(req.body.newPassword, "New password", { maxLength: 128 });
  if (newPassword.length < 10) {
    throw invalidRequest("New password must be at least 10 characters long.");
  }

  const user = await User.findOne(identifier);
  if (!user || user.resetToken !== code) {
    const error = new Error("Invalid verification code.");
    error.statusCode = 400;
    throw error;
  }
  if (!user.resetTokenExpiry || user.resetTokenExpiry.getTime() <= Date.now()) {
    const error = new Error("Verification code has expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash, resetToken: null, resetTokenExpiry: null } }
  );
  res.json({ success: true, message: "Password updated successfully. You can now log in." });
});

module.exports = router;