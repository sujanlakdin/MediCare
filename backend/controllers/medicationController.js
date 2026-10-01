const Medication = require('../models/Medication');

const defaultMedications = [
  {
    _id: '650000000000000000000101',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Daily',
    scheduledTime: '08:00 AM',
    instructions: 'Take 1 tablet in the morning with food',
    status: 'taken',
    adherencePercent: 95,
  },
  {
    _id: '650000000000000000000102',
    name: 'Atorvastatin',
    dosage: '20mg',
    frequency: 'Daily',
    scheduledTime: '08:00 AM',
    instructions: 'Take 1 tablet at breakfast',
    status: 'taken',
    adherencePercent: 90,
  },
  {
    _id: '650000000000000000000103',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    scheduledTime: '12:30 PM',
    instructions: 'Take 1 tablet after lunch with full glass of water',
    status: 'missed',
    adherencePercent: 75,
  },
  {
    _id: '650000000000000000000104',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Daily',
    scheduledTime: '09:00 PM',
    instructions: 'Take 1 tablet before bedtime',
    status: 'upcoming',
    adherencePercent: 88,
  },
];

// @desc    Get medications for a patient
// @route   GET /api/medications
// @access  Public / Protected
exports.getMedications = async (req, res) => {
  try {
    const meds = await Medication.find().sort({ createdAt: -1 });
    if (!meds || meds.length === 0) {
      return res.json(defaultMedications);
    }
    res.json(meds);
  } catch (error) {
    res.json(defaultMedications);
  }
};

// @desc    Add a new medication
// @route   POST /api/medications
// @access  Public / Protected
exports.addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, scheduledTime, instructions, patientId } = req.body;

    if (!name || !dosage || !scheduledTime) {
      return res.status(400).json({ message: 'Name, dosage, and scheduled time are required' });
    }

    const newMed = await Medication.create({
      patientId: patientId || '650000000000000000000001',
      name,
      dosage,
      frequency: frequency || 'Daily',
      scheduledTime,
      instructions: instructions || 'Take with water after meals.',
      status: 'upcoming',
      adherencePercent: 100,
    });

    res.status(201).json(newMed);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to add medication' });
  }
};

// @desc    Update medication log status (taken/missed/upcoming)
// @route   PATCH /api/medications/:id/status
// @access  Public / Protected
exports.updateMedicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const med = await Medication.findById(req.params.id);

    if (!med) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    med.status = status || med.status;
    await med.save();

    res.json(med);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update medication details (name, dosage, scheduledTime, instructions, frequency)
// @route   PUT /api/medications/:id
// @access  Public / Protected
exports.updateMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, scheduledTime, instructions } = req.body;
    const med = await Medication.findById(req.params.id);

    if (!med) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    if (name) med.name = name;
    if (dosage) med.dosage = dosage;
    if (frequency) med.frequency = frequency;
    if (scheduledTime) med.scheduledTime = scheduledTime;
    if (instructions) med.instructions = instructions;

    await med.save();
    res.json(med);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update medication' });
  }
};

// @desc    Delete a medication
// @route   DELETE /api/medications/:id
// @access  Public / Protected
exports.deleteMedication = async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
