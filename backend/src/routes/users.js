const express = require("express");
const User = require("../models/User");
const {
  readBoolean,
  readDate,
  readEmail,
  readPhone,
  readString,
} = require("../validation");

const router = express.Router();
const notificationKeys = [
  "medicationReminders",
  "reminderSound",
  "vibration",
  "missedMedicationAlerts",
  "caregiverNotifications",
];
const accessibilityKeys = ["highContrast", "largerButtons", "reduceMotion"];

function pickSettings(input, booleanKeys, extraKeys = []) {
  const settings = {};
  for (const key of booleanKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) settings[key] = readBoolean(input[key], key);
  }
  for (const key of extraKeys) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      settings[key] = readString(input[key], key, { maxLength: 20 });
    }
  }
  if (Object.prototype.hasOwnProperty.call(settings, "preferredReminderTime") && !/^([01]\d|2[0-3]):[0-5]\d$/.test(settings.preferredReminderTime)) {
    const error = new Error("Preferred reminder time must use 24-hour HH:MM format.");
    error.statusCode = 400;
    throw error;
  }
  if (!Object.keys(settings).length) {
    const error = new Error("Provide at least one setting to update.");
    error.statusCode = 400;
    throw error;
  }
  return settings;
}

router.get("/profile", async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash").lean();
  if (!user) return res.status(404).json({ error: "Profile not found." });
  res.json({ profile: user });
});

router.put("/profile", async (req, res) => {
  const updates = {};
  const body = req.body;
  if (Object.prototype.hasOwnProperty.call(body, "fullName")) {
    updates.fullName = readString(body.fullName, "Full name", { maxLength: 120 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "email")) updates.email = readEmail(body.email);
  if (Object.prototype.hasOwnProperty.call(body, "phone")) {
    updates.phone = readPhone(body.phone, { required: false });
  }
  if (Object.prototype.hasOwnProperty.call(body, "dateOfBirth")) updates.dateOfBirth = readDate(body.dateOfBirth);
  if (Object.prototype.hasOwnProperty.call(body, "gender")) {
    updates.gender = readString(body.gender, "Gender", { required: false, maxLength: 60 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "address")) {
    updates.address = readString(body.address, "Address", { required: false, maxLength: 300 });
  }
  if (!Object.keys(updates).length) {
    const error = new Error("Provide at least one profile field to update.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true, runValidators: true })
      .select("-passwordHash")
      .lean();
    if (!user) return res.status(404).json({ error: "Profile not found." });
    res.json({ profile: user });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "That email is already in use." });
    throw error;
  }
});

router.get("/notification-settings", async (req, res) => {
  const user = await User.findById(req.userId).select("notificationSettings").lean();
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.notificationSettings });
});

router.put("/notification-settings", async (req, res) => {
  const settings = pickSettings(req.body, notificationKeys, ["preferredReminderTime"]);
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: Object.fromEntries(Object.entries(settings).map(([key, value]) => [`notificationSettings.${key}`, value])) },
    { new: true, runValidators: true }
  ).select("notificationSettings");
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.notificationSettings });
});

router.get("/accessibility-settings", async (req, res) => {
  const user = await User.findById(req.userId).select("accessibilitySettings").lean();
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.accessibilitySettings });
});

router.put("/accessibility-settings", async (req, res) => {
  const settings = pickSettings(req.body, accessibilityKeys, ["fontSize"]);
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: Object.fromEntries(Object.entries(settings).map(([key, value]) => [`accessibilitySettings.${key}`, value])) },
    { new: true, runValidators: true }
  ).select("accessibilitySettings");
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.accessibilitySettings });
});

router.get("/emergency-contact", async (req, res) => {
  const user = await User.findById(req.userId).select("emergencyContact").lean();
  if (!user) return res.status(404).json({ error: "Emergency contact not found." });
  res.json({ emergencyContact: user.emergencyContact });
});

router.put("/emergency-contact", async (req, res) => {
  const emergencyContact = {
    name: readString(req.body.name, "Name", { maxLength: 120 }),
    relationship: readString(req.body.relationship, "Relationship", { maxLength: 80 }),
    phone: readPhone(req.body.phone),
    email: readEmail(req.body.email || "", { required: false }),
  };
  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { emergencyContact } },
    { new: true, runValidators: true }
  ).select("emergencyContact");
  if (!user) return res.status(404).json({ error: "Profile not found." });
  res.json({ emergencyContact: user.emergencyContact });
});

module.exports = router;