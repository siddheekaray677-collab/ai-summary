const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, getAllMeetings } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.get('/meetings', protect, admin, getAllMeetings);

module.exports = router;
