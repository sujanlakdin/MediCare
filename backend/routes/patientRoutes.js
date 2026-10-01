const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, updateVitals } = require('../controllers/patientController');

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.put('/:id/vitals', updateVitals);

module.exports = router;
