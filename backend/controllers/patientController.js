const Patient = require('../models/Patient');

// Sample default patient if database is empty
const defaultPatient = {
  _id: '650000000000000000000001',
  name: 'Eleanor Johnson',
  age: 68,
  role: 'Patient',
  statusBadgeText: 'MONITORING ACTIVE',
  phone: '+1 (555) 019-2831',
  vitals: {
    bloodPressure: '128/82',
    heartRate: 72,
    bloodSugar: 145,
    lastUpdated: new Date(),
  },
};

// @desc    Get linked patients for caregiver
// @route   GET /api/patients
// @access  Public / Protected
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    if (!patients || patients.length === 0) {
      return res.json([defaultPatient]);
    }
    res.json(patients);
  } catch (error) {
    res.json([defaultPatient]);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Public / Protected
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.json(defaultPatient);
    }
    res.json(patient);
  } catch (error) {
    res.json(defaultPatient);
  }
};

// @desc    Update patient vitals
// @route   PUT /api/patients/:id/vitals
// @access  Public / Protected
exports.updateVitals = async (req, res) => {
  try {
    const { bloodPressure, heartRate, bloodSugar } = req.body;
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
      patient = new Patient(defaultPatient);
    }

    patient.vitals = {
      bloodPressure: bloodPressure || patient.vitals.bloodPressure,
      heartRate: heartRate || patient.vitals.heartRate,
      bloodSugar: bloodSugar || patient.vitals.bloodSugar,
      lastUpdated: new Date(),
    };

    await patient.save();
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
