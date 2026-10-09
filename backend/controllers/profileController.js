const User = require("../models/User");
const mongoose = require("mongoose");
const inMemoryUserStore = require("../src/store/inMemoryUserStore");

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Seed or retrieve the default elderly profile (Chathura Rajapakse, 72 yrs)
 */
async function getOrCreateElderlyUser() {
  if (isDbConnected()) {
    try {
      let user = await User.findOne({ email: "chathura.rajapakse@medicare.com" });
      if (!user) {
        user = await User.findOne();
      }
      if (!user) {
        user = new User({
          fullName: "Chathura Rajapakse",
          email: "chathura.rajapakse@medicare.com",
          phone: "+94 77 123 4567",
          password: "MedicarePass2026!",
          age: 72,
          residentialAddress: "No. 45, Temple Road, Colombo 03",
          medicalId: "MED-72491",
          accessibilitySettings: {
            highContrast: false,
            largerTouchTargets: true,
            voiceAssistance: false,
            reduceMotion: false,
            simpleLanguage: true,
            textSize: "large",
          },
        });
        await user.save();
        console.log("Seeded default elderly user profile for Chathura Rajapakse (Age 72).");
      }
      return user;
    } catch (err) {
      console.warn("MongoDB elderly seed failed, falling back to in-memory:", err.message);
    }
  }

  return (
    (await inMemoryUserStore.findById("650000000000000000000001")) ||
    (await inMemoryUserStore.findByEmail("chathura.rajapakse@medicare.com")) ||
    (inMemoryUserStore.getAllUsers()[0])
  );
}

/**
 * Helper to find user by param or default
 */
async function findUserByIdOrFallback(identifier) {
  if (identifier && identifier !== "default" && identifier !== "current") {
    if (isDbConnected()) {
      try {
        if (mongoose.Types.ObjectId.isValid(identifier)) {
          const user = await User.findById(identifier);
          if (user) return user;
        } else {
          const user = await User.findOne({ email: identifier.toLowerCase().trim() });
          if (user) return user;
        }
      } catch (err) {
        console.warn("MongoDB find failed, falling back to in-memory:", err.message);
      }
    }

    const memUser = (await inMemoryUserStore.findById(identifier)) || (await inMemoryUserStore.findByEmail(identifier));
    if (memUser) return memUser;
  }
  return await getOrCreateElderlyUser();
}

/**
 * GET /api/profile
 * GET /api/profile/:id
 * Read user profile details and accessibility settings
 */
exports.getProfile = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || req.query.email;
    const user = await findUserByIdOrFallback(id);

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully.",
      user: typeof user.toSafeObject === "function" ? user.toSafeObject() : user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve user profile.",
    });
  }
};

/**
 * PUT /api/profile
 * PUT /api/profile/:id
 * CRUD Operation 1: Update personal & medical contact details
 * (fullName, age, phone, residentialAddress, medicalId)
 */
exports.updateProfile = async (req, res) => {
  try {
    const id = req.params.id || req.body._id || req.body.id || req.query.id;
    const user = await findUserByIdOrFallback(id);

    const { fullName, age, phone, residentialAddress, medicalId } = req.body;

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (age !== undefined) {
      const parsedAge = Number(age);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid age between 0 and 130.",
        });
      }
      user.age = parsedAge;
    }
    if (phone !== undefined) user.phone = phone.trim();
    if (residentialAddress !== undefined) user.residentialAddress = residentialAddress.trim();
    if (medicalId !== undefined) user.medicalId = medicalId.trim();

    if (typeof user.save === "function") {
      try {
        await user.save();
      } catch (err) {
        console.warn("MongoDB user.save failed:", err.message);
      }
    }
    await inMemoryUserStore.updateUser(user._id || user.id, {
      fullName: user.fullName,
      age: user.age,
      phone: user.phone,
      residentialAddress: user.residentialAddress,
      medicalId: user.medicalId,
    });

    return res.status(200).json({
      success: true,
      message: "Profile details updated successfully.",
      user: typeof user.toSafeObject === "function" ? user.toSafeObject() : user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile details.",
    });
  }
};

/**
 * PUT /api/profile/accessibility
 * PUT /api/profile/:id/accessibility
 * CRUD Operation 2: Read settings, Update elderly accessibility toggle preferences
 * (highContrast, largerTouchTargets, voiceAssistance, reduceMotion, simpleLanguage, textSize)
 */
exports.updateAccessibility = async (req, res) => {
  try {
    const id = req.params.id || req.body._id || req.body.id || req.query.id;
    const user = await findUserByIdOrFallback(id);

    const {
      highContrast,
      largerTouchTargets,
      voiceAssistance,
      reduceMotion,
      simpleLanguage,
      textSize,
    } = req.body;

    if (!user.accessibilitySettings) {
      user.accessibilitySettings = {};
    }

    if (highContrast !== undefined) user.accessibilitySettings.highContrast = Boolean(highContrast);
    if (largerTouchTargets !== undefined) user.accessibilitySettings.largerTouchTargets = Boolean(largerTouchTargets);
    if (voiceAssistance !== undefined) user.accessibilitySettings.voiceAssistance = Boolean(voiceAssistance);
    if (reduceMotion !== undefined) user.accessibilitySettings.reduceMotion = Boolean(reduceMotion);
    if (simpleLanguage !== undefined) user.accessibilitySettings.simpleLanguage = Boolean(simpleLanguage);
    if (textSize !== undefined) {
      const validSizes = ["normal", "large", "extra-large"];
      if (validSizes.includes(textSize)) {
        user.accessibilitySettings.textSize = textSize;
      }
    }

    if (typeof user.save === "function") {
      try {
        await user.save();
      } catch (err) {
        console.warn("MongoDB user.save failed:", err.message);
      }
    }
    await inMemoryUserStore.updateUser(user._id || user.id, {
      accessibilitySettings: user.accessibilitySettings,
    });

    return res.status(200).json({
      success: true,
      message: "Elderly accessibility preferences saved successfully.",
      accessibilitySettings: user.accessibilitySettings,
      user: typeof user.toSafeObject === "function" ? user.toSafeObject() : user,
    });
  } catch (error) {
    console.error("Update Accessibility Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update accessibility preferences.",
    });
  }
};
