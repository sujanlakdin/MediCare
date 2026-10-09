const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema(
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
    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/,
    },
    repeat: {
      type: String,
      enum: ['Every Day', 'Weekdays', 'Custom'],
      default: 'Every Day',
    },
    startDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    snoozeEnabled: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      default: '',
      maxlength: 200,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reminder', ReminderSchema);