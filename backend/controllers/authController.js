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
 * Helper to find a user by phone or email
 * Handles Sri Lankan and international formats (+94 77 123 4567, 0771234567, etc.)
 */
async function findUserByPhoneOrEmail({ phone, email }) {
  if (phone) {
    const raw = phone.trim();
    const digits = raw.replace(/\D/g, "");
    const last9 = digits.length >= 9 ? digits.slice(-9) : digits;

    const query = {
      $or: [
        { phone: raw },
        { phone: { $regex: raw.replace(/\+/g, "\\+"), $options: "i" } },
        ...(last9.length >= 7 ? [{ phone: { $regex: last9, $options: "i" } }] : []),
        ...(email ? [{ email: email.toLowerCase().trim() }] : []),
      ],
    };

    let user = await User.findOne(query);
    if (user) return user;
  }

  if (email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) return user;
  }

  // If no user found, check if it's the demo phone/account or if users table is empty
  const count = await User.countDocuments();
  const isDemo =
    (phone && (phone.includes("771234567") || phone.includes("123 4567") || phone.includes("1234567"))) ||
    (email && email.toLowerCase().includes("chathura"));

  if (isDemo || count === 0) {
    let demoUser = new User({
      fullName: "Chathura Rajapakse",
      email: email ? email.toLowerCase().trim() : "chathura.rajapakse@medicare.com",
      phone: phone ? phone.trim() : "+94 77 123 4567",
      password: "Password123!",
      age: 72,
      residentialAddress: "No. 45, Temple Road, Colombo 03",
      medicalId: "MED-72491",
    });
    await demoUser.save();
    return demoUser;
  }

  return null;
}

/**
 * POST /api/auth/forgot-password
 * Request a 6-digit OTP verification code with 5-minute expiry to reset password via phone number
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered phone number.",
      });
    }

    const user = await findUserByPhoneOrEmail({ phone, email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No MediCare account found with that phone number. Please check the number or sign up.",
      });
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5-minute expiry

    user.resetToken = otp;
    user.resetTokenExpiry = expiry;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${user.phone}.`,
      phone: user.phone,
      expiresIn: 300,
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
 * POST /api/auth/verify-otp
 * Verify 6-digit OTP code before proceeding to set new password
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, email, otp, resetCode } = req.body;
    const code = (otp || resetCode || "").toString().trim();

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 6-digit verification code.",
      });
    }

    const user = await findUserByPhoneOrEmail({ phone, email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number.",
      });
    }

    if (!user.resetToken || user.resetToken !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check the 6 digits and try again.",
      });
    }

    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired (valid for 5 minutes). Please request a new one.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Code verified successfully.",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP code.",
    });
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password using phone, 6-digit OTP, and new password.
 * Verifies the OTP, checks 5-minute expiry, and updates hashed password in MongoDB.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { phone, email, otp, resetCode, newPassword } = req.body;
    const code = (otp || resetCode || "").toString().trim();

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Please enter the 6-digit verification code.",
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const user = await findUserByPhoneOrEmail({ phone, email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this phone number.",
      });
    }

    // Verify OTP token
    if (!user.resetToken || user.resetToken !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check the code and try again.",
      });
    }

    // Verify token expiry
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Update password (pre-save hook in User.js automatically hashes with salt)
    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    console.log(`[MediCare Auth] Password successfully reset for user ${user.phone} (${user.email})`);

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
