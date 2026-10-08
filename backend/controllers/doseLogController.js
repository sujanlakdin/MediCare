const mongoose = require('mongoose');
const DoseLog = require('../models/DoseLog');

exports.getDoseLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.medicationId) filter.medicationId = req.query.medicationId;
    res.json(await DoseLog.find(filter).sort({ at: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDoseLog = async (req, res) => {
  try {
    const { medicationId, status, note, sideEffects, at } = req.body;
    if (!medicationId || !mongoose.isValidObjectId(medicationId)) {
      return res.status(400).json({ message: 'A valid medicationId is required' });
    }
    if (!['taken', 'skipped'].includes(status)) {
      return res.status(400).json({ message: 'Status must be taken or skipped' });
    }
    if (note && note.length > 200) {
      return res.status(400).json({ message: 'Note must be 200 characters or less' });
    }
    const log = await DoseLog.create({
      medicationId,
      status,
      note: note || '',
      sideEffects: Array.isArray(sideEffects) ? sideEffects : [],
      ...(at ? { at } : {}),
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to log dose' });
  }
};

exports.deleteDoseLog = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
    await DoseLog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dose log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};