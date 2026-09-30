const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

/**
 * Authentication Routes (Member 1)
 * Prefix: /api/auth
 */

// POST /api/auth/register - Register new elderly user or caregiver
router.post("/register", authController.register);

// POST /api/auth/login - User login
router.post("/login", authController.login);

// POST /api/auth/forgot-password - Request verification code for password reset
router.post("/forgot-password", authController.forgotPassword);

// POST /api/auth/reset-password - Verify code and set new password
router.post("/reset-password", authController.resetPassword);

module.exports = router;
