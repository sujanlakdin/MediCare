const Medication = require('../models/Medication');

const defaultMedicationsByPatient = {
  '650000000000000000000001': [
    {
      _id: '650000000000000000000101',
      patientId: '650000000000000000000001',
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
      patientId: '650000000000000000000001',
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
      patientId: '650000000000000000000001',
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
      patientId: '650000000000000000000001',
      name: 'Amlodipine',
      dosage: '5mg',
      frequency: 'Daily',
      scheduledTime: '09:00 PM',
      instructions: 'Take 1 tablet before bedtime',
      status: 'upcoming',
      adherencePercent: 88,
    },
  ],
  '650000000000000000000002': [
    {
      _id: '650000000000000000000201',
      patientId: '650000000000000000000002',
      name: 'Insulin Glargine',
      dosage: '20 Units',
      frequency: 'Daily',
      scheduledTime: '08:00 AM',
      instructions: 'Subcutaneous injection before breakfast',
      status: 'taken',
      adherencePercent: 100,
    },
    {
      _id: '650000000000000000000202',
      patientId: '650000000000000000000002',
      name: 'Omeprazole',
      dosage: '20mg',
      frequency: 'Daily',
      scheduledTime: '09:00 AM',
      instructions: 'Take 30 mins before first meal',
      status: 'taken',
      adherencePercent: 92,
    },
    {
      _id: '650000000000000000000203',
      patientId: '650000000000000000000002',
      name: 'Aspirin',
      dosage: '81mg',
      frequency: 'Daily',
      scheduledTime: '08:00 PM',
      instructions: 'Take low-dose aspirin with evening meal',
      status: 'upcoming',
      adherencePercent: 95,
    },
  ],
  '650000000000000000000003': [
    {
      _id: '650000000000000000000301',
      patientId: '650000000000000000000003',
      name: 'Losartan',
      dosage: '50mg',
      frequency: 'Daily',
      scheduledTime: '08:00 AM',
      instructions: 'Take 1 tablet in morning for BP control',
      status: 'missed',
      adherencePercent: 68,
    },
    {
      _id: '650000000000000000000302',
      patientId: '650000000000000000000003',
      name: 'Metformin XR',
      dosage: '1000mg',
      frequency: 'Daily',
      scheduledTime: '01:00 PM',
      instructions: 'Take with dinner',
      status: 'upcoming',
      adherencePercent: 72,
    },
    {
      _id: '650000000000000000000303',
      patientId: '650000000000000000000003',
      name: 'Gabapentin',
      dosage: '300mg',
      frequency: 'Twice daily',
      scheduledTime: '09:00 PM',
      instructions: 'Take at night to manage nerve discomfort',
      status: 'upcoming',
      adherencePercent: 80,
    },
  ],
};

const allDefaultMedications = Object.values(defaultMedicationsByPatient).flat();

// @desc    Get medications for a patient
// @route   GET /api/medications?patientId=...
// @access  Public / Protected
exports.getMedications = async (req, res) => {
  try {
    const { patientId } = req.query;
    const query = patientId ? { patientId } : {};
    const meds = await Medication.find(query).sort({ createdAt: -1 });

    if (!meds || meds.length === 0) {
      if (patientId && defaultMedicationsByPatient[patientId]) {
        return res.json(defaultMedicationsByPatient[patientId]);
      }
      return res.json(allDefaultMedications);
    }
    res.json(meds);
  } catch (error) {
    if (req.query.patientId && defaultMedicationsByPatient[req.query.patientId]) {
      return res.json(defaultMedicationsByPatient[req.query.patientId]);
    }
    res.json(allDefaultMedications);
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
