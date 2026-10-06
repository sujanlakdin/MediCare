const Patient = require('../models/Patient');

// Sample default patients if database is empty
const defaultPatients = [
  {
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
  },
  {
    _id: '650000000000000000000002',
    name: 'Robert Chen',
    age: 74,
    role: 'Patient',
    statusBadgeText: 'MONITORING ACTIVE',
    phone: '+1 (555) 019-4412',
    vitals: {
      bloodPressure: '135/88',
      heartRate: 78,
      bloodSugar: 110,
      lastUpdated: new Date(),
    },
  },
  {
    _id: '650000000000000000000003',
    name: 'Maria Garcia',
    age: 62,
    role: 'Patient',
    statusBadgeText: 'ATTENTION NEEDED',
    phone: '+1 (555) 019-8890',
    vitals: {
      bloodPressure: '142/92',
      heartRate: 84,
      bloodSugar: 168,
      lastUpdated: new Date(),
    },
  },
];

const defaultPatient = defaultPatients[0];

// @desc    Get linked patients for caregiver
// @route   GET /api/patients
// @access  Public / Protected
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    if (!patients || patients.length === 0) {
      return res.json(defaultPatients);
    }
    res.json(patients);
  } catch (error) {
    res.json(defaultPatients);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Public / Protected
exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      const foundSample = defaultPatients.find((p) => p._id === req.params.id);
      return res.json(foundSample || defaultPatient);
    }
    res.json(patient);
  } catch (error) {
    const foundSample = defaultPatients.find((p) => p._id === req.params.id);
    res.json(foundSample || defaultPatient);
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
      const sample = defaultPatients.find((p) => p._id === req.params.id) || defaultPatient;
      patient = new Patient(sample);
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
