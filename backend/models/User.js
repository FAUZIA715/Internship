// models/User.js - Combined (Auth + Document module fields)
const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['candidate', 'hr', 'admin'],
    default: 'candidate'
  },
  position: {
    type: String,
    default: null
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  // Document module fields
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  // Auth module fields
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);