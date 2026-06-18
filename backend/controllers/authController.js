const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// ─── Token Generator ─────────────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// ─── Password Validator ───────────────────────────────────────────
const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  return null; // null means valid
};

// ─── Login ────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, portalRole } = req.body;

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

    // RBAC — block wrong portal access
    if (portalRole && user.role !== portalRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This portal is for ${portalRole}s only.`
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

// ─── Change Password ──────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Protected
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old and new password'
      });
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
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

// ─── Get Profile ──────────────────────────────────────────────────
// @route   GET /api/auth/profile
// @access  Protected
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Forgot Password ──────────────────────────────────────────────
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

    // Block unactivated accounts
    if (user.isFirstLogin) {
      return res.status(400).json({
        success: false,
        message: 'Account not yet activated. Please login with your temporary password first.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `http://localhost:5173/${user.role}/reset-password/${resetToken}`;

    await sendEmail({
      to: email,
      subject: 'VeriFlow BGV — Password Reset Request',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8faff; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">VeriFlow BGV System</h1>
          </div>
          <h2 style="color: #1f2937; margin-bottom: 8px;">Password Reset Request</h2>
          <p style="color: #6b7280; margin-bottom: 24px;">
            You requested a password reset for your VeriFlow account. Click the button below to reset your password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 24px;">
            Reset Password
          </a>
          <p style="color: #9ca3af; font-size: 13px; margin-bottom: 8px;">
            This link expires in <strong>15 minutes</strong>.
          </p>
          <p style="color: #9ca3af; font-size: 13px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: `Password reset link sent to ${email}`
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ─── Register ──────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
      role: role || 'candidate'
    });

    res.status(201).json({
      success: true,
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

// ─── Reset Password ───────────────────────────────────────────────
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    // Validate new password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({
        success: false,
        message: passwordError
      });
    }

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
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