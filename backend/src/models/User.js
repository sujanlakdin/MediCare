const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema(
  {
    medicationReminders: { type: Boolean, default: true },
    reminderSound: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true },
    missedMedicationAlerts: { type: Boolean, default: true },
    caregiverNotifications: { type: Boolean, default: true },
    preferredReminderTime: { type: String, default: "09:00" },
  },
  { _id: false }
);

const accessibilitySettingsSchema = new mongoose.Schema(
  {
    fontSize: { type: String, enum: ["standard", "large", "extraLarge"], default: "standard" },
    highContrast: { type: Boolean, default: false },
    largerButtons: { type: Boolean, default: false },
    reduceMotion: { type: Boolean, default: false },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: "", trim: true },
    relationship: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["patient", "caregiver"], default: "patient" },
    phone: { type: String, default: "", trim: true, maxlength: 30 },
    dateOfBirth: { type: String, default: "" },
    gender: { type: String, default: "", trim: true, maxlength: 60 },
    address: { type: String, default: "", trim: true, maxlength: 300 },
    profilePhotoUrl: { type: String, default: "", trim: true },
    notificationSettings: { type: notificationSettingsSchema, default: () => ({}) },
    accessibilitySettings: { type: accessibilitySettingsSchema, default: () => ({}) },
    emergencyContact: { type: emergencyContactSchema, default: () => ({}) },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);