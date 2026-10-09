const express = require('express');
const router = express.Router();

const {
  getDoseLogs,
  getDoseLogById,
  createDoseLog,
  updateDoseLog,
  deleteDoseLog,
} = require('../controllers/doseLogController');

router.get('/', getDoseLogs);
router.get('/:id', getDoseLogById);
router.post('/', createDoseLog);
router.put('/:id', updateDoseLog);
router.delete('/:id', deleteDoseLog);

module.exports = router;