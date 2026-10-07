const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      default: 'Patient',
    },
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusBadgeText: {
      type: String,
      default: 'MONITORING ACTIVE',
    },
    vitals: {
      bloodPressure: { type: String, default: '128/82' },
      heartRate: { type: Number, default: 72 },
      bloodSugar: { type: Number, default: 145 },
      lastUpdated: { type: Date, default: Date.now },
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2831',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);
