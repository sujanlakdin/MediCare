const mongoose = require('mongoose');

const DoseLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      immutable: true,
      index: true,
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    status: {
      type: String,
      enum: ['taken', 'skipped'],
      required: true,
    },
    at: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
      maxlength: 200,
    },
    sideEffects: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoseLog', DoseLogSchema);