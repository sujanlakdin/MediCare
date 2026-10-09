const mongoose = require("mongoose");

/**
 * Medication Mongoose Schema (Member 1 - Patient Medication Management)
 * Models patient medications stored in MongoDB with full dose schedules,
 * adherence tracking, and optional base64 / URL photo attachments.
 */
const MedicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medication name is required"],
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
      default: "",
    },
    form: {
      type: String,
      enum: ["Tablet", "Capsule", "Syrup"],
      default: "Tablet",
    },
    qty: {
      type: Number,
      default: 1,
      min: 1,
    },
    meal: {
      type: String,
      default: "After food",
    },
    times: {
      type: [String],
      default: ["08:00"],
    },
    days: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    repeat: {
      type: String,
      default: "Daily",
    },
    start: {
      type: String,
      default: "",
    },
    end: {
      type: String,
      default: "",
    },
    stock: {
      type: Number,
      default: 30,
      min: 0,
    },
    alert: {
      type: Boolean,
      default: true,
    },
    taken: {
      type: Map,
      of: Boolean,
      default: {},
    },
    image: {
      type: String,
      default: "",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProfileUser",
      required: false,
    },
    patientId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Medication", MedicationSchema);
