const express = require('express');
const router = express.Router();
const {
  getMedications,
  addMedication,
  updateMedication,
  updateMedicationStatus,
  deleteMedication,
} = require('../controllers/medicationController');

router.get('/', getMedications);
router.post('/', addMedication);
router.put('/:id', updateMedication);
router.patch('/:id/status', updateMedicationStatus);
router.delete('/:id', deleteMedication);

module.exports = router;
