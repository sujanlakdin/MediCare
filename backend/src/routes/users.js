const express = require("express");
const User = require("../models/User");
const {
  readAge,
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
  "missedDoseAlerts",
  "caregiverSync",
  "soundAssistance",
  "vibrationMode",
];
const notificationStringKeys = [
  "preferredReminderTime",
  "morningReminderTime",
  "noonReminderTime",
  "eveningReminderTime",
];
const accessibilityKeys = [
  "highContrast",
  "largerButtons",
  "largerTouchTargets",
  "voiceAssistance",
  "reduceMotion",
  "simpleLanguage",
];

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
  for (const timeKey of notificationStringKeys) {
    if (Object.prototype.hasOwnProperty.call(settings, timeKey) && !/^([01]\d|2[0-3]):[0-5]\d$/.test(settings[timeKey])) {
      const error = new Error(`${timeKey} must use 24-hour HH:MM format.`);
      error.statusCode = 400;
      throw error;
    }
  }
  if (Object.prototype.hasOwnProperty.call(settings, "fontSize") && !["standard", "large", "extraLarge"].includes(settings.fontSize)) {
    const error = new Error("fontSize must be standard, large, or extraLarge.");
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
  if (Object.prototype.hasOwnProperty.call(body, "age")) {
    updates.age = readAge(body.age, { required: false });
  }
  if (Object.prototype.hasOwnProperty.call(body, "dateOfBirth")) updates.dateOfBirth = readDate(body.dateOfBirth);
  if (Object.prototype.hasOwnProperty.call(body, "gender")) {
    updates.gender = readString(body.gender, "Gender", { required: false, maxLength: 60 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "address")) {
    updates.address = readString(body.address, "Address", { required: false, maxLength: 300 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "medicalId")) {
    updates.medicalId = readString(body.medicalId, "Medical ID", { required: false, maxLength: 60 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "profileImage")) {
    updates.profileImage = readString(body.profileImage, "Profile image", { required: false, maxLength: 5000 });
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
  const settings = pickSettings(req.body, notificationKeys, notificationStringKeys);
  // Synchronize aliases
  if (settings.missedDoseAlerts !== undefined) settings.missedMedicationAlerts = settings.missedDoseAlerts;
  else if (settings.missedMedicationAlerts !== undefined) settings.missedDoseAlerts = settings.missedMedicationAlerts;

  if (settings.caregiverSync !== undefined) settings.caregiverNotifications = settings.caregiverSync;
  else if (settings.caregiverNotifications !== undefined) settings.caregiverSync = settings.caregiverNotifications;

  if (settings.soundAssistance !== undefined) settings.reminderSound = settings.soundAssistance;
  else if (settings.reminderSound !== undefined) settings.soundAssistance = settings.reminderSound;

  if (settings.vibrationMode !== undefined) settings.vibration = settings.vibrationMode;
  else if (settings.vibration !== undefined) settings.vibrationMode = settings.vibration;

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
  // Synchronize largerTouchTargets and largerButtons
  if (settings.largerTouchTargets !== undefined) settings.largerButtons = settings.largerTouchTargets;
  else if (settings.largerButtons !== undefined) settings.largerTouchTargets = settings.largerButtons;

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