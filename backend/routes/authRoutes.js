const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  updateUserSettings
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/settings', protect, updateUserSettings);

module.exports = router;
