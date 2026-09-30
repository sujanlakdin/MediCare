const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

/**
 * Profile & Accessibility Routes (Member 1)
 * Prefix: /api/profile
 */

// Accessibility updates (Specific sub-routes declared first to avoid param collision)
// PUT /api/profile/accessibility
router.put("/accessibility", profileController.updateAccessibility);
// PUT /api/profile/:id/accessibility
router.put("/:id/accessibility", profileController.updateAccessibility);

// CRUD 1: Read user profile
// GET /api/profile (reads current/default elderly user: Chathura Rajapakse)
router.get("/", profileController.getProfile);
// GET /api/profile/:id
router.get("/:id", profileController.getProfile);

// CRUD 1: Update personal and medical contact details
// PUT /api/profile
router.put("/", profileController.updateProfile);
// PUT /api/profile/:id
router.put("/:id", profileController.updateProfile);

module.exports = router;
