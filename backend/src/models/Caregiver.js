const mongoose = require("mongoose");

const caregiverSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    relationship: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    email: { type: String, default: "", lowercase: true, trim: true, maxlength: 254 },
    isPrimary: { type: Boolean, default: false },
    medicationAlerts: { type: Boolean, default: true },
    missedMedicationAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Caregiver", caregiverSchema);