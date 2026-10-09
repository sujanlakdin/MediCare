const mongoose = require('mongoose');
const Reminder = require('../models/Reminder');
const Medication = require('../models/Medication');

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const FIELDS = [
  'medicationId',
  'time',
  'repeat',
  'startDate',
  'snoozeEnabled',
  'note',
];

function validate(data) {
  if (
    typeof data.medicationId !== 'string' ||
    !mongoose.isValidObjectId(data.medicationId)
  ) {
    return 'A valid medicationId is required';
  }

  if (typeof data.time !== 'string' || !TIME_RE.test(data.time)) {
    return 'Time must be in HH:MM format';
  }

  if (
    typeof data.startDate !== 'string' ||
    !DATE_RE.test(data.startDate)
  ) {
    return 'Start date must be in YYYY-MM-DD format';
  }

  const date = new Date(`${data.startDate}T00:00:00.000Z`);
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== data.startDate
  ) {
    return 'Start date must be a valid calendar date';
  }

  if (
    data.repeat !== undefined &&
    !['Every Day', 'Weekdays', 'Custom'].includes(data.repeat)
  ) {
    return 'Repeat must be Every Day, Weekdays or Custom';
  }

  if (
    data.snoozeEnabled !== undefined &&
    typeof data.snoozeEnabled !== 'boolean'
  ) {
    return 'Snooze must be true or false';
  }

  if (
    data.note !== undefined &&
    (typeof data.note !== 'string' || data.note.length > 200)
  ) {
    return 'Note must be text with 200 characters or less';
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
    return res.status(400).json({ message: 'Invalid reminder data' });
  }

  console.error('Reminder operation failed:', error);
  return res.status(500).json({ message: 'Reminder operation failed' });
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

async function isDuplicate(userId, medicationId, time, ignoreId) {
  const query = { userId, medicationId, time };
  if (ignoreId) query._id = { $ne: ignoreId };
  return Boolean(await Reminder.exists(query));
}

exports.getReminders = async (req, res) => {
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

    return res.json(await Reminder.find(filter).sort({ time: 1 }));
  } catch (error) {
    return handleError(res, error);
  }
};

exports.getReminderById = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    return res.json(reminder);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.createReminder = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const data = pickFields(req.body || {});
    const validationError = validate(data);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!(await ownsMedication(data.medicationId, req.userId))) {
      return res.status(404).json({ message: 'Owned medication not found' });
    }

    if (await isDuplicate(req.userId, data.medicationId, data.time)) {
      return res.status(400).json({
        message: 'A reminder already exists for this medication at this time',
      });
    }

    const reminder = await Reminder.create({
      ...data,
      userId: req.userId,
    });

    return res.status(201).json(reminder);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.updateReminder = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const updates = pickFields(req.body || {});
    const merged = {
      ...reminder.toObject(),
      ...updates,
      medicationId: String(updates.medicationId ?? reminder.medicationId),
    };

    const validationError = validate(merged);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!(await ownsMedication(merged.medicationId, req.userId))) {
      return res.status(404).json({ message: 'Owned medication not found' });
    }

    if (
      await isDuplicate(
        req.userId,
        merged.medicationId,
        merged.time,
        reminder._id
      )
    ) {
      return res.status(400).json({
        message: 'A reminder already exists for this medication at this time',
      });
    }

    Object.assign(reminder, updates);
    await reminder.save();
    return res.json(reminder);
  } catch (error) {
    return handleError(res, error);
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }

    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    return res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    return handleError(res, error);
  }
};