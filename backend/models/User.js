const mongoose = require("mongoose");
const crypto = require("crypto");

/**
 * Hash a password using Node.js built-in crypto (PBKDF2 with salt)
 * Ensures 100% reliability without external binary dependencies.
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

const AccessibilitySettingsSchema = new mongoose.Schema(
  {
    highContrast: {
      type: Boolean,
      default: false,
    },
    largerTouchTargets: {
      type: Boolean,
      default: true,
    },
    voiceAssistance: {
      type: Boolean,
      default: false,
    },
    reduceMotion: {
      type: Boolean,
      default: false,
    },
    simpleLanguage: {
      type: Boolean,
      default: true,
    },
    textSize: {
      type: String,
      enum: ["normal", "large", "extra-large"],
      default: "large",
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      default: "Chathura Rajapakse",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      default: "+94 77 123 4567",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    salt: {
      type: String,
    },
    age: {
      type: Number,
      default: 72,
      min: [0, "Age cannot be negative"],
      max: [130, "Please enter a valid age"],
    },
    residentialAddress: {
      type: String,
      trim: true,
      default: "No. 45, Temple Road, Colombo 03",
    },
    medicalId: {
      type: String,
      trim: true,
      default: "MED-72491",
    },
    accessibilitySettings: {
      type: AccessibilitySettingsSchema,
      default: () => ({}),
    },
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre("save", function () {
  if (!this.isModified("password")) {
    return;
  }

  // Generate salt and hash
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = hashPassword(this.password, this.salt);
});

// Instance method to compare password
UserSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.salt || !this.password) return false;
  const candidateHash = hashPassword(candidatePassword, this.salt);
  return candidateHash === this.password;
};

// Instance method to safely return public profile (strip password & salt)
UserSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  delete user.salt;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  return user;
};

module.exports =
  mongoose.models.LegacyUser || mongoose.model("LegacyUser", UserSchema, "users");
