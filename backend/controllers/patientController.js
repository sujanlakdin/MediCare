const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const User = require('../src/models/User');
const inMemoryUserStore = require('../src/store/inMemoryUserStore');

// Sample default patients if database is empty
const defaultPatients = [
  {
    _id: '650000000000000000000001',
    name: 'Eleanor Johnson',
    age: 68,
    role: 'Patient',
    statusBadgeText: 'MONITORING ACTIVE',
    phone: '+1 (555) 019-2831',
    bloodGroup: 'O+',
    primaryDiagnosis: 'Hypertension & Type 2 Diabetes',
    allergies: 'Penicillin, Sulfa drugs',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
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
    bloodGroup: 'A+',
    primaryDiagnosis: 'Post-Stroke Rehabilitation',
    allergies: 'None recorded',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
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
    bloodGroup: 'B+',
    primaryDiagnosis: 'Mild Asthma & Joint Osteoarthritis',
    allergies: 'Aspirin, Shellfish',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    vitals: {
      bloodPressure: '142/92',
      heartRate: 84,
      bloodSugar: 168,
      lastUpdated: new Date(),
    },
  },
];

const defaultPatient = defaultPatients[0];
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to format User model to Patient item
function formatUserToPatient(u) {
  const uid = u._id ? u._id.toString() : u.id;
  return {
    _id: uid,
    name: u.fullName || 'Registered Patient',
    age: u.age || 65,
    role: 'Patient',
    statusBadgeText: 'MONITORING ACTIVE',
    phone: u.emergencyContact?.phone || u.phone || '+94 77 000 0000',
    bloodGroup: u.bloodGroup || 'O+',
    primaryDiagnosis: u.primaryDiagnosis || 'General Monitoring',
    allergies: u.allergies || 'None recorded',
    avatarUrl: u.profilePhotoUrl || u.avatarUrl || '',
    vitals: {
      bloodPressure: u.vitals?.bloodPressure || '120/80',
      heartRate: u.vitals?.heartRate || 75,
      bloodSugar: u.vitals?.bloodSugar || 115,
      lastUpdated: new Date(),
    },
  };
}

// @desc    Get linked patients for caregiver
// @route   GET /api/patients
// @access  Public / Protected
exports.getPatients = async (req, res) => {
  try {
    const dbPatients = isDbConnected() ? await Patient.find().lean() : [];
    let registeredPatients = [];

    // Query DB Users if connected
    if (isDbConnected()) {
      try {
        const users = await User.find({ role: { $nin: ['caregiver', 'Caregiver'] } }).lean();
        registeredPatients = users.map(formatUserToPatient);
      } catch (err) {
        console.warn('Failed to fetch DB patients:', err.message);
      }
    }

    // Also include patients registered in in-memory store
    try {
      const memUsers = inMemoryUserStore.getAllUsers().filter((u) => u.role !== 'caregiver' && u.role !== 'Caregiver');
      const memPatients = memUsers.map(formatUserToPatient);
      
      const existingIds = new Set(registeredPatients.map((p) => p._id));
      for (const mp of memPatients) {
        if (!existingIds.has(mp._id)) {
          registeredPatients.push(mp);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch memory store patients:', err.message);
    }

    // Combine dbPatients, registeredPatients, and defaultPatients without duplicates
    const combined = [...registeredPatients, ...dbPatients];
    const existingIds = new Set(combined.map((p) => p._id.toString()));

    for (const defP of defaultPatients) {
      if (!existingIds.has(defP._id)) {
        combined.push(defP);
      }
    }

    res.json(combined);
  } catch (error) {
    res.json(defaultPatients);
  }
};

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
// @access  Public / Protected
exports.getPatientById = async (req, res) => {
  try {
    const patient = isDbConnected() ? await Patient.findById(req.params.id) : null;
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
