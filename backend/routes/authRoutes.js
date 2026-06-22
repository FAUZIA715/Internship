// routes/authRoutes.js
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

// ============ PUBLIC ROUTES ============
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ============ PROTECTED ROUTES ============
router.put('/change-password', protect, changePassword);
router.get('/profile', protect, getProfile);

module.exports = router;