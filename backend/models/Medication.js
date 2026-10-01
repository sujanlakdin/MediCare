const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      default: 'Daily',
    },
    scheduledTime: {
      type: String,
      required: true, // e.g. "08:00 AM"
    },
    instructions: {
      type: String,
      default: 'Take with food and water.',
    },
    status: {
      type: String,
      enum: ['taken', 'missed', 'upcoming'],
      default: 'upcoming',
    },
    adherencePercent: {
      type: Number,
      default: 90,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', MedicationSchema);
