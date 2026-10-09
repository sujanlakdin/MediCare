const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const User = require("../models/User");
const inMemoryUserStore = require("../store/inMemoryUserStore");
const {
  readBoolean,
  readDate,
  readEmail,
  readPhone,
  readString,
} = require("../validation");

const router = express.Router();
const uploadDirectory = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const fileName = `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
      callback(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      return callback(new Error("Please select a valid image."));
    }

    callback(null, true);
  },
});

function getUploadFileName(profilePhotoUrl) {
  if (!profilePhotoUrl) return null;
  try {
    const pathname = new URL(profilePhotoUrl).pathname;
    const fileName = pathname.split("/").filter(Boolean).pop();
    return fileName || null;
  } catch {
    return profilePhotoUrl.split("/").filter(Boolean).pop() || null;
  }
}

function removeStoredProfilePhoto(profilePhotoUrl) {
  const fileName = getUploadFileName(profilePhotoUrl);
  if (!fileName) return;

  const fullPath = path.join(uploadDirectory, fileName);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

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

async function getUserById(userId) {
  if (inMemoryUserStore.isDbConnected()) {
    try {
      const user = await User.findById(userId).select("-passwordHash").lean();
      if (user) return user;
    } catch (err) {
      console.warn("MongoDB findById failed, falling back to in-memory store:", err.message);
    }
  }
  const memUser = await inMemoryUserStore.findById(userId);
  if (memUser) {
    const copy = { ...memUser };
    delete copy.passwordHash;
    return copy;
  }
  return null;
}

async function updateUserById(userId, updates) {
  if (inMemoryUserStore.isDbConnected()) {
    try {
      const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true })
        .select("-passwordHash")
        .lean();
      if (user) {
        await inMemoryUserStore.updateUser(userId, updates);
        return user;
      }
    } catch (err) {
      if (err.code === 11000) throw err;
      console.warn("MongoDB findByIdAndUpdate failed, using in-memory store:", err.message);
    }
  }
  const memUser = await inMemoryUserStore.updateUser(userId, updates);
  if (memUser) {
    const copy = { ...memUser };
    delete copy.passwordHash;
    return copy;
  }
  return null;
}

const handleProfilePhotoUpload = async (req, res) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Please select a valid image.");
    error.statusCode = 400;
    throw error;
  }

  const user = await getUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Profile not found." });

  const previousPhotoUrl = user.profilePhotoUrl || "";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const profilePhotoUrl = `${baseUrl}/uploads/${encodeURIComponent(file.filename)}`;

  const updatedUser = await updateUserById(req.userId, { profilePhotoUrl });
  if (!updatedUser) return res.status(404).json({ error: "Profile not found." });

  if (previousPhotoUrl && previousPhotoUrl !== profilePhotoUrl) removeStoredProfilePhoto(previousPhotoUrl);

  res.json({
    success: true,
    message: "Profile photo updated successfully",
    profilePhoto: updatedUser.profilePhotoUrl || "",
  });
};

router.put("/profile-photo", upload.single("photo"), handleProfilePhotoUpload);
router.post("/profile-photo", upload.single("photo"), handleProfilePhotoUpload);

router.delete("/profile-photo", async (req, res) => {
  const user = await getUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Profile not found." });

  const previousPhotoUrl = user.profilePhotoUrl || "";
  const updatedUser = await updateUserById(req.userId, { profilePhotoUrl: "" });
  if (!updatedUser) return res.status(404).json({ error: "Profile not found." });

  if (previousPhotoUrl) removeStoredProfilePhoto(previousPhotoUrl);

  res.json({
    success: true,
    message: "Profile photo removed successfully",
    profilePhoto: "",
  });
});

router.get("/profile", async (req, res) => {
  const user = await getUserById(req.userId);
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
  if (Object.prototype.hasOwnProperty.call(body, "age") && body.age !== null && body.age !== undefined && body.age !== "") {
    const parsedAge = Number(body.age);
    if (!isNaN(parsedAge) && parsedAge >= 0 && parsedAge <= 130) {
      updates.age = parsedAge;
    }
  }
  if (Object.prototype.hasOwnProperty.call(body, "dateOfBirth") && body.dateOfBirth) {
    updates.dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : readDate(body.dateOfBirth);
  }
  if (Object.prototype.hasOwnProperty.call(body, "gender") && body.gender) {
    updates.gender = readString(body.gender, "Gender", { required: false, maxLength: 60 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "bloodGroup") && body.bloodGroup) {
    updates.bloodGroup = readString(body.bloodGroup, "Blood group", { required: false, maxLength: 10 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "primaryDiagnosis") && body.primaryDiagnosis) {
    updates.primaryDiagnosis = readString(body.primaryDiagnosis, "Primary diagnosis", { required: false, maxLength: 200 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "allergies") && body.allergies) {
    updates.allergies = readString(body.allergies, "Allergies", { required: false, maxLength: 200 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "vitals") && typeof body.vitals === "object" && body.vitals !== null) {
    updates.vitals = {
      bloodPressure: readString(body.vitals.bloodPressure || "120/80", "Blood pressure", { required: false, maxLength: 20 }),
      heartRate: Number(body.vitals.heartRate) || 75,
      bloodSugar: Number(body.vitals.bloodSugar) || 115,
    };
  }
  if (Object.prototype.hasOwnProperty.call(body, "address")) {
    updates.address = readString(body.address, "Address", { required: false, maxLength: 300 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "profilePhotoUrl")) {
    updates.profilePhotoUrl = readString(body.profilePhotoUrl, "Profile photo URL", { required: false, maxLength: 2048 });
  }
  if (Object.prototype.hasOwnProperty.call(body, "emergencyContact") && typeof body.emergencyContact === "object" && body.emergencyContact !== null) {
    updates.emergencyContact = {
      name: readString(body.emergencyContact.name || "", "Emergency contact name", { required: false, maxLength: 120 }),
      relationship: readString(body.emergencyContact.relationship || "", "Relationship", { required: false, maxLength: 80 }),
      phone: readString(body.emergencyContact.phone || "", "Emergency phone", { required: false, maxLength: 30 }),
      email: readString(body.emergencyContact.email || "", "Emergency email", { required: false, maxLength: 254 }),
    };
  }
  if (!Object.keys(updates).length) {
    const error = new Error("Provide at least one profile field to update.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const user = await updateUserById(req.userId, updates);
    if (!user) return res.status(404).json({ error: "Profile not found." });

    // Sync with Patient model if available
    try {
      const Patient = require("../../models/Patient");
      if (inMemoryUserStore.isDbConnected()) {
        await Patient.findByIdAndUpdate(
          req.userId,
          {
            $set: {
              ...(updates.fullName ? { name: updates.fullName } : {}),
              ...(updates.age ? { age: updates.age } : {}),
              ...(updates.phone ? { phone: updates.phone } : {}),
            },
          },
          { runValidators: false }
        );
      }
    } catch {}

    res.json({ profile: user, message: "Profile updated successfully." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "That email is already in use." });
    throw error;
  }
});

router.get("/notification-settings", async (req, res) => {
  const user = await getUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.notificationSettings });
});

router.put("/notification-settings", async (req, res) => {
  const settings = pickSettings(req.body, notificationKeys, ["preferredReminderTime"]);
  const updates = Object.fromEntries(Object.entries(settings).map(([key, value]) => [`notificationSettings.${key}`, value]));
  const user = await updateUserById(req.userId, updates);
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.notificationSettings });
});

router.get("/accessibility-settings", async (req, res) => {
  const user = await getUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.accessibilitySettings });
});

router.put("/accessibility-settings", async (req, res) => {
  const settings = pickSettings(req.body, accessibilityKeys, ["fontSize"]);
  const updates = Object.fromEntries(Object.entries(settings).map(([key, value]) => [`accessibilitySettings.${key}`, value]));
  const user = await updateUserById(req.userId, updates);
  if (!user) return res.status(404).json({ error: "Settings not found." });
  res.json({ settings: user.accessibilitySettings });
});

router.get("/emergency-contact", async (req, res) => {
  const user = await getUserById(req.userId);
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
  const user = await updateUserById(req.userId, { emergencyContact });
  if (!user) return res.status(404).json({ error: "Profile not found." });
  res.json({ emergencyContact: user.emergencyContact });
});

module.exports = router;