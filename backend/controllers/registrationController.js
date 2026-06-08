const RegistrationRequest = require('../models/RegistrationRequest');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8).toUpperCase();
};

// @desc    Candidate submits registration request
// @route   POST /api/registration/submit
// @access  Public
exports.submitRequest = async (req, res) => {
  try {
    const { name, email, phone, position } = req.body;

    if (!name || !email || !phone || !position) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone and position'
      });
    }

    // Check if already requested
    const existingRequest = await RegistrationRequest.findOne({ email });
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `A request with this email already exists. Status: ${existingRequest.status}`
      });
    }

    // Check if already a user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please login.'
      });
    }

    const request = await RegistrationRequest.create({
      name,
      email,
      phone,
      position
    });

    // Send confirmation email to candidate
    await sendEmail({
      to: email,
      subject: 'BGV System - Registration Request Received',
      html: `
        <h2>Hello ${name},</h2>
        <p>Your registration request has been received successfully.</p>
        <p><strong>Position Applied:</strong> ${position}</p>
        <p>Our admin team will review your request and get back to you shortly.</p>
        <p>You will receive your login credentials via email once approved.</p>
        <br/>
        <p>Regards,<br/>BGV System Team</p>
      `
    });

    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully. You will receive an email once approved.',
      request: {
        id: request._id,
        name: request.name,
        email: request.email,
        position: request.position,
        status: request.status
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin gets all registration requests
// @route   GET /api/registration/all
// @access  Admin only
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await RegistrationRequest.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin approves request - creates account + sends temp password
// @route   PUT /api/registration/approve/:id
// @access  Admin only
exports.approveRequest = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists for this email'
      });
    }

    // Generate temp password
    const tempPassword = generateTempPassword();
    const tempPasswordExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create user account
    await User.create({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: 'candidate',
      isSelected: true,
      isFirstLogin: true,
      tempPasswordExpiry
    });

    // Update request status
    request.status = 'approved';
    await request.save();

    // Send approval email with credentials
    await sendEmail({
      to: request.email,
      subject: 'BGV System - Application Approved! Your Login Credentials',
      html: `
        <h2>Congratulations ${request.name}!</h2>
        <p>Your registration request for <strong>${request.position}</strong> has been approved.</p>
        <p>Your login credentials for the BGV Verification Portal:</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
          <p><strong>Email:</strong> ${request.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p><strong>Valid Until:</strong> ${tempPasswordExpiry.toDateString()}</p>
        </div>
        <p>Please login and change your password immediately.</p>
        <p style="color:#dc2626;"><strong>Important:</strong> This password expires in 7 days.</p>
        <br/>
        <p>Regards,<br/>BGV System Team</p>
      `
    });

    res.status(200).json({
      success: true,
      message: `Request approved. Login credentials sent to ${request.email}`
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Admin rejects request
// @route   PUT /api/registration/reject/:id
// @access  Admin only
exports.rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await RegistrationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Registration request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`
      });
    }

    request.status = 'rejected';
    request.rejectionReason = reason || 'No reason provided';
    await request.save();

    // Send rejection email
    await sendEmail({
      to: request.email,
      subject: 'BGV System - Registration Request Update',
      html: `
        <h2>Hello ${request.name},</h2>
        <p>We regret to inform you that your registration request for 
        <strong>${request.position}</strong> has not been approved at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you believe this is an error, please contact our team.</p>
        <br/>
        <p>Regards,<br/>BGV System Team</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Request rejected and candidate notified via email'
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Candidate checks their request status
// @route   GET /api/registration/status/:email
// @access  Public
exports.checkStatus = async (req, res) => {
  try {
    const request = await RegistrationRequest.findOne({
      email: req.params.email
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'No registration request found for this email'
      });
    }

    res.status(200).json({
      success: true,
      status: request.status,
      name: request.name,
      position: request.position,
      createdAt: request.createdAt
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};