const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const validate = (b) => {
  if (!b.medicationId || !mongoose.isValidObjectId(b.medicationId)) return 'A valid medicationId is required';
  if (!TIME_RE.test(b.time || '')) return 'Time must be in HH:MM format';
  if (!DATE_RE.test(b.startDate || '')) return 'Start date must be in YYYY-MM-DD format';
  if (b.note && b.note.length > 200) return 'Note must be 200 characters or less';
  return null;
};

const isDuplicate = async (medicationId, time, ignoreId) => {
  const query = { medicationId, time };
  if (ignoreId) query._id = { $ne: ignoreId };
  return !!(await Reminder.findOne(query));
};

exports.getReminders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.medicationId) filter.medicationId = req.query.medicationId;
    res.json(await Reminder.find(filter).sort({ time: 1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReminderById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReminder = async (req, res) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ message: error });
    if (await isDuplicate(req.body.medicationId, req.body.time)) {
      return res.status(400).json({ message: 'A reminder already exists for this medication at this time' });
    }
    const { medicationId, time, repeat, startDate, snoozeEnabled, note } = req.body;
    const reminder = await Reminder.create({ medicationId, time, repeat, startDate, snoozeEnabled, note });
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create reminder' });
  }
};

exports.updateReminder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });

    const merged = { ...reminder.toObject(), ...req.body };
    const error = validate({ ...merged, medicationId: String(merged.medicationId) });
    if (error) return res.status(400).json({ message: error });
    if (await isDuplicate(merged.medicationId, merged.time, reminder._id)) {
      return res.status(400).json({ message: 'A reminder already exists for this medication at this time' });
    }

    ['medicationId', 'time', 'repeat', 'startDate', 'snoozeEnabled', 'note'].forEach((key) => {
      if (req.body[key] !== undefined) reminder[key] = req.body[key];
    });
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update reminder' });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};