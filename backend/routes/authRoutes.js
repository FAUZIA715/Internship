const express = require('express');
const router = express.Router();
const {
  login,
  changePassword,
  getProfile,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.put('/change-password', protect, changePassword);
router.get('/profile', protect, getProfile);

module.exports = router;
