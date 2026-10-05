const express = require('express');
const router = express.Router();
const { getDoseLogs, createDoseLog, deleteDoseLog } = require('../controllers/doseLogController');

router.get('/', getDoseLogs);
router.post('/', createDoseLog);
router.delete('/:id', deleteDoseLog);

module.exports = router;