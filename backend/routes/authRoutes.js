const express = require('express');
const router = express.Router();
const {
  login,
  changePassword,
  getProfile,
  forgotPassword,
  resetPassword,
  loginValidation,
  changePasswordValidation,
  forgotPasswordValidation
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// ─── Public routes ────────────────────────────────────────────────
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ─── Protected routes ─────────────────────────────────────────────
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.get('/profile', protect, getProfile);

module.exports = router;
