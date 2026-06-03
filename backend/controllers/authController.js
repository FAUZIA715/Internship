const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8).toUpperCase();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
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

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'candidate',
      isFirstLogin: false
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      isFirstLogin: user.isFirstLogin,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.isFirstLogin = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin selects candidate - sends temp password email
// @route   POST /api/auth/select-candidate
// @access  Admin only
exports.selectCandidate = async (req, res) => {
  try {
    const { name, email } = req.body;

    const tempPassword = generateTempPassword();
    const tempPasswordExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Candidate already exists'
      });
    }

    const candidate = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'candidate',
      isSelected: true,
      isFirstLogin: true,
      tempPasswordExpiry
    });

    await sendEmail({
      to: email,
      subject: 'BGV System - Your Verification Portal Access',
      html: `
        <h2>Welcome ${name},</h2>
        <p>You have been selected for background verification.</p>
        <p>Your temporary login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p><strong>Valid until:</strong> ${tempPasswordExpiry.toDateString()}</p>
        <p>Please login and change your password immediately.</p>
        <br/>
        <p>Regards,<br/>BGV System Team</p>
      `
    });

    res.status(201).json({
      success: true,
      message: `Candidate selected and email sent to ${email}`,
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'BGV System - Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your BGV System account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background:#6366f1;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin:10px 0;">Reset Password</a>
        <p>This link expires in <strong>15 minutes</strong>.</p>
        <p>If you didn't request this, ignore this email.</p>
        <br/>
        <p>Regards,<br/>BGV System Team</p>
      `
    });

    res.status(200).json({
      success: true,
      message: `Password reset email sent to ${email}`
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resetToken } = req.params;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.isFirstLogin = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login.'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};