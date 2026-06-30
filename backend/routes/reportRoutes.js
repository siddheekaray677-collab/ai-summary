const express = require('express');
const router = express.Router();
const { exportReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.get('/export/:meetingId/:format', protect, exportReport);

module.exports = router;
