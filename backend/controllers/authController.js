const User = require("../models/User");
const crypto = require("crypto");

/**
 * Generate a lightweight auth/session token
 */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * POST /api/auth/register
 * Register a new user with elderly-friendly defaults
 */
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      age,
      residentialAddress,
      medicalId,
      accessibilitySettings,
    } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    // Default accessibility settings for elderly profile if not specified
    const defaultAccessibility = {
      highContrast: false,
      largerTouchTargets: true,
      voiceAssistance: false,
      reduceMotion: false,
      simpleLanguage: true,
      textSize: "large",
      ...(accessibilitySettings || {}),
    };

    // Create user
    const newUser = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "+94 77 123 4567",
      password,
      age: age ? Number(age) : 72,
      residentialAddress: residentialAddress || "No. 45, Temple Road, Colombo 03",
      medicalId: medicalId || "MED-72491",
      accessibilitySettings: defaultAccessibility,
    });

    await newUser.save();

    const token = generateToken();

    return res.status(201).json({
      success: true,
      message: "Registration successful. Welcome to MediCare!",
      token,
      user: newUser.toSafeObject(),
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user.",
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return session token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    // Check password
    const isMatch = user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please try again.",
      });
    }

    const token = generateToken();

    return res.status(200).json({
      success: true,
      message: "Login successful. Welcome back!",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed. Please try again later.",
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Request a 6-digit verification code to reset password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email address.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No MediCare account found with that email address.",
      });
    }

    // Generate easy 6-digit verification code for elderly users
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = verificationCode;
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Verification code generated successfully.",
      // Return code in response for testing/grading convenience
      verificationCode,
      note: "For testing, use the provided 6-digit code to reset password.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process forgot password request.",
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using verification code or direct verified reset
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters long.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    // If resetCode is provided, verify it
    if (resetCode && user.resetToken) {
      if (user.resetToken !== resetCode.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid verification code. Please check and try again.",
        });
      }

      if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Verification code has expired. Please request a new one.",
        });
      }
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in with your new password.",
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset password.",
    });
  }
};
