const mongoose = require('mongoose');
const DoseLog = require('../models/DoseLog');
const Medication = require('../models/Medication');

const FIELDS = ['status', 'note', 'sideEffects', 'at'];

function validate(data) {
  if (!['taken', 'skipped'].includes(data.status)) {
    return 'Status must be taken or skipped';
  }

  if (
    data.note !== undefined &&
    (typeof data.note !== 'string' || data.note.length > 200)
  ) {
    return 'Note must be text with 200 characters or less';
  }

  if (
    data.sideEffects !== undefined &&
    (
      !Array.isArray(data.sideEffects) ||
      data.sideEffects.length > 20 ||
      data.sideEffects.some(
        (value) =>
          typeof value !== 'string' ||
          !value.trim() ||
          value.length > 100
      )
    )
  ) {
    return 'Side effects must contain up to 20 text entries, each 1–100 characters';
  }

  if (
    data.at !== undefined &&
    (
      !(typeof data.at === 'string' || data.at instanceof Date) ||
      Number.isNaN(new Date(data.at).getTime())
    )
  ) {
    return 'Dose time must be a valid date';
  }

  return null;
}

function pickFields(body) {
  const result = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) result[field] = body[field];
  }
  return result;
}

function handleError(res, error) {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid dose log data' });
  }

  console.error('Dose log operation failed:', error);
  return res.status(500).json({ message: 'Dose log operation failed' });
}

async function ownsMedication(medicationId, userId) {
  if (!mongoose.isValidObjectId(userId)) return false;

  return Boolean(
    await Medication.exists({
      _id: medicationId,
      user_id: userId,
    })
  );
}

exports.getDoseLogs = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const filter = { userId: req.userId };

    if (req.query.medicationId !== undefined) {
      if (
        typeof req.query.medicationId !== 'string' ||
        !mongoose.isValidObjectId(req.query.medicationId)
      ) {
        return res.status(400).json({ message: 'Invalid medicationId' });
      }
      filter.medicationId = req.query.medicationId;
    }

    return res.json(await DoseLog.find(filter).sort({ at: -1 }));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getDoseLogById = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const log = await DoseLog.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: 'Dose log not found' });
    }

    return res.json(log);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createDoseLog = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const body = req.body || {};
    const { medicationId } = body;

    if (
      typeof medicationId !== 'string' ||
      !mongoose.isValidObjectId(medicationId)
    ) {
      return res.status(400).json({
        message: 'A valid medicationId is required',
      });
    }

    const data = pickFields(body);
    const validationError = validate(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!(await ownsMedication(medicationId, req.userId))) {
      return res.status(404).json({ message: 'Owned medication not found' });
    }

    const log = await DoseLog.create({
      ...data,
      medicationId,
      userId: req.userId,
    });

    return res.status(201).json(log);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateDoseLog = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const log = await DoseLog.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: 'Dose log not found' });
    }

    const body = req.body || {};

    if (body.medicationId !== undefined) {
      return res.status(400).json({
        message: 'The medication of an existing dose log cannot be changed',
      });
    }

    const updates = pickFields(body);
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'Provide status, note, sideEffects or at to update',
      });
    }

    const validationError = validate({
      ...log.toObject(),
      ...updates,
    });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!(await ownsMedication(log.medicationId, req.userId))) {
      return res.status(404).json({ message: 'Owned medication not found' });
    }

    Object.assign(log, updates);
    await log.save();
    return res.json(log);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteDoseLog = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const log = await DoseLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!log) {
      return res.status(404).json({ message: 'Dose log not found' });
    }

    return res.json({ message: 'Dose log deleted successfully' });
  } catch (error) {
    return handleError(res, error);
  }
};