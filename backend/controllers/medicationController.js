const mongoose = require("mongoose");
const Medication = require("../models/Medication");

// In-memory store fallback when MongoDB Atlas connection is connecting / pending IP whitelist
let localMeds = [
  {
    _id: "66f000000000000000000001",
    id: "66f000000000000000000001",
    patientId: "650000000000000000000001",
    name: "Lisinopril 10mg",
    purpose: "Blood pressure",
    form: "Tablet",
    qty: 1,
    meal: "After food",
    times: ["08:00"],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: "Daily",
    start: "",
    end: "",
    stock: 24,
    alert: true,
    taken: { "08:00": true },
    image: "",
  },
  {
    _id: "66f000000000000000000002",
    id: "66f000000000000000000002",
    patientId: "650000000000000000000001",
    name: "Atorvastatin 20mg",
    purpose: "Cholesterol",
    form: "Tablet",
    qty: 1,
    meal: "After food",
    times: ["08:00"],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: "Daily",
    start: "",
    end: "",
    stock: 18,
    alert: true,
    taken: { "08:00": true },
    image: "",
  },
  {
    _id: "66f000000000000000000003",
    id: "66f000000000000000000003",
    patientId: "650000000000000000000002",
    name: "Metformin 500mg",
    purpose: "Diabetes management",
    form: "Tablet",
    qty: 1,
    meal: "After food",
    times: ["12:30", "18:00"],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: "Daily",
    start: "",
    end: "",
    stock: 6,
    alert: true,
    taken: {},
    image: "",
  },
  {
    _id: "66f000000000000000000004",
    id: "66f000000000000000000004",
    patientId: "650000000000000000000003",
    name: "Amlodipine 5mg",
    purpose: "Blood pressure",
    form: "Tablet",
    qty: 1,
    meal: "After food",
    times: ["21:00"],
    days: [0, 1, 2, 3, 4, 5, 6],
    repeat: "Daily",
    start: "",
    end: "",
    stock: 30,
    alert: true,
    taken: {},
    image: "",
  },
];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * GET /api/medications
 * Retrieve patient medications filtered by patientId if provided.
 */
exports.getMedications = async (req, res) => {
  try {
    const { patientId } = req.query;

    if (isDbConnected()) {
      const filter = patientId ? { patientId } : {};
      let medications = await Medication.find(filter).sort({ createdAt: -1 });

      if (medications.length === 0 && !patientId) {
        medications = await Medication.insertMany(localMeds);
      }

      return res.status(200).json({
        success: true,
        source: "mongodb",
        count: medications.length,
        data: medications,
      });
    }

    // Graceful fallback when MongoDB Atlas connection is pending
    let filteredLocal = localMeds;
    if (patientId) {
      filteredLocal = localMeds.filter((m) => m.patientId === patientId || (!m.patientId && patientId === '650000000000000000000001'));
    }

    res.status(200).json({
      success: true,
      source: "memory-store",
      count: filteredLocal.length,
      data: filteredLocal,
    });
  } catch (error) {
    console.error("Error fetching medications:", error.message);
    res.status(200).json({
      success: true,
      source: "memory-fallback",
      count: localMeds.length,
      data: localMeds,
    });
  }
};

/**
 * GET /api/medications/:id
 * Retrieve single medication details by id.
 */
exports.getMedicationById = async (req, res) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      const medication = await Medication.findById(id);
      if (medication) {
        return res.status(200).json({
          success: true,
          source: "mongodb",
          data: medication,
        });
      }
    }

    const localFound = localMeds.find((m) => m._id === id || m.id === id);
    if (!localFound) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    res.status(200).json({
      success: true,
      source: "memory-store",
      data: localFound,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching medication details",
      error: error.message,
    });
  }
};

/**
 * POST /api/medications
 * Add a new medication with optional photo (base64 or URL).
 */
exports.createMedication = async (req, res) => {
  try {
    const {
      name,
      purpose,
      form,
      qty,
      meal,
      times,
      days,
      repeat,
      start,
      end,
      stock,
      alert,
      taken,
      image,
      patientId,
    } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Medication name is required",
      });
    }

    const cleanTimes = Array.isArray(times)
      ? [...new Set(times.map((t) => t.trim()))].sort()
      : ["08:00"];

    const cleanDays = Array.isArray(days)
      ? [...new Set(days)].sort()
      : [0, 1, 2, 3, 4, 5, 6];

    const medData = {
      name: name.trim(),
      purpose: (purpose || "").trim(),
      form: form || "Tablet",
      qty: Math.max(1, Number(qty) || 1),
      meal: meal || "After food",
      times: cleanTimes,
      days: cleanDays,
      repeat: repeat || "Daily",
      start: (start || "").trim(),
      end: (end || "").trim(),
      stock: Math.max(0, Number(stock) || 0),
      alert: alert !== undefined ? Boolean(alert) : true,
      taken: taken || {},
      image: image || "",
      patientId: patientId || "",
    };

    if (isDbConnected()) {
      const newMedication = new Medication(medData);
      const saved = await newMedication.save();
      return res.status(201).json({
        success: true,
        source: "mongodb",
        message: "Medication created successfully",
        data: saved,
      });
    }

    const newId = new mongoose.Types.ObjectId().toString();
    const newLocal = { ...medData, _id: newId, id: newId, createdAt: new Date() };
    localMeds.unshift(newLocal);

    res.status(201).json({
      success: true,
      source: "memory-store",
      message: "Medication created successfully",
      data: newLocal,
    });
  } catch (error) {
    console.error("Error creating medication:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create medication",
      error: error.message,
    });
  }
};

/**
 * PUT /api/medications/:id
 * Update existing medication details and preserve / update photo.
 */
exports.updateMedication = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (isDbConnected()) {
      const medication = await Medication.findById(id);
      if (medication) {
        if (updates.name !== undefined) medication.name = updates.name.trim();
        if (updates.purpose !== undefined) medication.purpose = updates.purpose.trim();
        if (updates.form !== undefined) medication.form = updates.form;
        if (updates.qty !== undefined) medication.qty = Math.max(1, Number(updates.qty) || 1);
        if (updates.meal !== undefined) medication.meal = updates.meal;
        if (updates.times !== undefined && Array.isArray(updates.times)) {
          medication.times = [...new Set(updates.times.map((t) => t.trim()))].sort();
        }
        if (updates.days !== undefined && Array.isArray(updates.days)) {
          medication.days = [...new Set(updates.days)].sort();
        }
        if (updates.repeat !== undefined) medication.repeat = updates.repeat;
        if (updates.start !== undefined) medication.start = (updates.start || "").trim();
        if (updates.end !== undefined) medication.end = (updates.end || "").trim();
        if (updates.stock !== undefined) medication.stock = Math.max(0, Number(updates.stock) || 0);
        if (updates.alert !== undefined) medication.alert = Boolean(updates.alert);
        if (updates.taken !== undefined) medication.taken = updates.taken;
        if (updates.image !== undefined) medication.image = updates.image;

        const updated = await medication.save();
        return res.status(200).json({
          success: true,
          source: "mongodb",
          message: "Medication updated successfully",
          data: updated,
        });
      }
    }

    const localIndex = localMeds.findIndex((m) => m._id === id || m.id === id);
    if (localIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Medication not found",
      });
    }

    const existing = localMeds[localIndex];
    const updatedLocal = {
      ...existing,
      ...updates,
      id,
      _id: id,
      image: updates.image !== undefined ? updates.image : existing.image,
    };
    localMeds[localIndex] = updatedLocal;

    res.status(200).json({
      success: true,
      source: "memory-store",
      message: "Medication updated successfully",
      data: updatedLocal,
    });
  } catch (error) {
    console.error("Error updating medication:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update medication",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/medications/:id
 * Remove a medication from MongoDB.
 */
exports.deleteMedication = async (req, res) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      await Medication.findByIdAndDelete(id);
    }

    localMeds = localMeds.filter((m) => m._id !== id && m.id !== id);

    res.status(200).json({
      success: true,
      message: "Medication deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Error deleting medication:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete medication",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/medications/:id/taken
 * Mark specific dose time as taken.
 */
exports.markDoseTaken = async (req, res) => {
  try {
    const { time } = req.body;
    const id = req.params.id;

    if (!time) {
      return res.status(400).json({
        success: false,
        message: "Time is required to record taken dose",
      });
    }

    if (isDbConnected()) {
      const medication = await Medication.findById(id);
      if (medication) {
        medication.taken.set(time, true);
        await medication.save();
        return res.status(200).json({
          success: true,
          source: "mongodb",
          message: `Dose at ${time} recorded as taken`,
          data: medication,
        });
      }
    }

    const localIndex = localMeds.findIndex((m) => m._id === id || m.id === id);
    if (localIndex !== -1) {
      localMeds[localIndex].taken = {
        ...localMeds[localIndex].taken,
        [time]: true,
      };
      return res.status(200).json({
        success: true,
        source: "memory-store",
        message: `Dose at ${time} recorded as taken`,
        data: localMeds[localIndex],
      });
    }

    res.status(404).json({
      success: false,
      message: "Medication not found",
    });
  } catch (error) {
    console.error("Error marking dose as taken:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record dose",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/medications/:id/alert
 * Toggle refill alert status.
 */
exports.toggleAlert = async (req, res) => {
  try {
    const id = req.params.id;

    if (isDbConnected()) {
      const medication = await Medication.findById(id);
      if (medication) {
        medication.alert = !medication.alert;
        await medication.save();
        return res.status(200).json({
          success: true,
          source: "mongodb",
          alert: medication.alert,
          data: medication,
        });
      }
    }

    const localIndex = localMeds.findIndex((m) => m._id === id || m.id === id);
    if (localIndex !== -1) {
      localMeds[localIndex].alert = !localMeds[localIndex].alert;
      return res.status(200).json({
        success: true,
        source: "memory-store",
        alert: localMeds[localIndex].alert,
        data: localMeds[localIndex],
      });
    }

    res.status(404).json({
      success: false,
      message: "Medication not found",
    });
  } catch (error) {
    console.error("Error toggling refill alert:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle refill alert",
      error: error.message,
    });
  }
};
