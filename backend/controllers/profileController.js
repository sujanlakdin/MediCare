const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * Seed or retrieve the default elderly profile (Chathura Rajapakse, 72 yrs)
 */
async function getOrCreateElderlyUser() {
  let user = await User.findOne({ email: "chathura.rajapakse@medicare.com" });
  if (!user) {
    // If not found by email, check if any user exists
    user = await User.findOne();
  }

  // If database is completely empty, seed the milestone prototype elderly user
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
}

/**
 * Helper to find user by param or default
 */
async function findUserByIdOrFallback(identifier) {
  if (identifier && identifier !== "default" && identifier !== "current") {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const user = await User.findById(identifier);
      if (user) return user;
    } else {
      const user = await User.findOne({ email: identifier.toLowerCase().trim() });
      if (user) return user;
    }
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
      user: user.toSafeObject(),
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

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile details updated successfully.",
      user: user.toSafeObject(),
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

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Elderly accessibility preferences saved successfully.",
      accessibilitySettings: user.accessibilitySettings,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Update Accessibility Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update accessibility preferences.",
    });
  }
};

/**
 * DELETE /api/profile
 * DELETE /api/profile/:id
 * CRUD Operation 3: Delete user profile / account from MongoDB Atlas
 */
exports.deleteProfile = async (req, res) => {
  try {
    const id = req.params?.id || req.body?._id || req.body?.id || req.query?.id;
    let deletedUser = null;

    if (id && id !== "default" && id !== "current") {
      if (mongoose.Types.ObjectId.isValid(id)) {
        deletedUser = await User.findByIdAndDelete(id);
      } else {
        deletedUser = await User.findOneAndDelete({ email: id.toLowerCase().trim() });
      }
    }

    if (!deletedUser) {
      // Delete current elderly user
      const user = (await User.findOne({ email: "chathura.rajapakse@medicare.com" })) || (await User.findOne());
      if (user) {
        deletedUser = await User.findByIdAndDelete(user._id);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Account and profile deleted successfully from MediCare.",
      id: deletedUser ? deletedUser._id : id,
    });
  } catch (error) {
    console.error("Delete Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete user profile.",
    });
  }
};
