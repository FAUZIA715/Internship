const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
  register,
  login,
  changePassword,
  getProfile,
  selectCandidate,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.put('/change-password', protect, changePassword);
router.get('/profile', protect, getProfile);

// Admin only routes
router.post('/select-candidate', protect, authorize('admin'), selectCandidate);

// Super admin creates another admin
router.post('/create-admin', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all fields'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isFirstLogin: false
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;