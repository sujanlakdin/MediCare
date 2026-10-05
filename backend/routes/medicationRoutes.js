const express = require("express");
const router = express.Router();
const medicationController = require("../controllers/medicationController");

/**
 * Medication Routes (Member 1 - Patient Medication Management)
 * Prefix: /api/medications
 */

// GET /api/medications - Retrieve all medications
router.get("/", medicationController.getMedications);

// GET /api/medications/:id - Retrieve specific medication details
router.get("/:id", medicationController.getMedicationById);

// POST /api/medications - Create a new medication with optional photo
router.post("/", medicationController.createMedication);

// PUT /api/medications/:id - Update medication details and photo
router.put("/:id", medicationController.updateMedication);

// DELETE /api/medications/:id - Remove medication
router.delete("/:id", medicationController.deleteMedication);

// PATCH /api/medications/:id/taken - Record dose as taken
router.patch("/:id/taken", medicationController.markDoseTaken);

// PATCH /api/medications/:id/alert - Toggle low stock refill alert
router.patch("/:id/alert", medicationController.toggleAlert);

module.exports = router;
