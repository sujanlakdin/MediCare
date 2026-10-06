const express = require("express");
const Caregiver = require("../models/Caregiver");
const { readBoolean, readEmail, readObjectId, readPhone, readString } = require("../validation");

const router = express.Router();

function caregiverFields(body, { partial = false } = {}) {
  const fields = {};
  const stringFields = [
    ["name", "Full name", 120],
    ["relationship", "Relationship", 80],
  ];
  for (const [key, label, maxLength] of stringFields) {
    if (!partial || Object.prototype.hasOwnProperty.call(body, key)) {
      fields[key] = readString(body[key], label, { maxLength });
    }
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, "phone")) {
    fields.phone = readPhone(body.phone);
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, "email")) {
    fields.email = readEmail(body.email || "", { required: false });
  }
  for (const key of ["isPrimary", "medicationAlerts", "missedMedicationAlerts"]) {
    if (!partial && body[key] !== undefined) fields[key] = readBoolean(body[key], key);
    if (partial && Object.prototype.hasOwnProperty.call(body, key)) fields[key] = readBoolean(body[key], key);
  }
  return fields;
}

async function setPrimary(userId, caregiverId) {
  await Caregiver.updateMany({ userId, _id: { $ne: caregiverId } }, { $set: { isPrimary: false } });
}

router.get("/", async (req, res) => {
  const caregivers = await Caregiver.find({ userId: req.userId }).sort({ isPrimary: -1, name: 1 }).lean();
  res.json({ caregivers });
});

router.post("/", async (req, res) => {
  const fields = caregiverFields(req.body);
  const caregiver = await Caregiver.create({ ...fields, userId: req.userId });
  if (caregiver.isPrimary) await setPrimary(req.userId, caregiver._id);
  res.status(201).json({ caregiver });
});

router.put("/:id", async (req, res) => {
  const id = readObjectId(req.params.id);
  const fields = caregiverFields(req.body, { partial: true });
  if (!Object.keys(fields).length) {
    const error = new Error("Provide at least one caregiver field to update.");
    error.statusCode = 400;
    throw error;
  }
  const caregiver = await Caregiver.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: fields },
    { new: true, runValidators: true }
  );
  if (!caregiver) return res.status(404).json({ error: "Caregiver not found." });
  if (caregiver.isPrimary) await setPrimary(req.userId, caregiver._id);
  res.json({ caregiver });
});

router.delete("/:id", async (req, res) => {
  const caregiver = await Caregiver.findOneAndDelete({
    _id: readObjectId(req.params.id),
    userId: req.userId,
  });
  if (!caregiver) return res.status(404).json({ error: "Caregiver not found." });
  res.status(204).end();
});

module.exports = router;