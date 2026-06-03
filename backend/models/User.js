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
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'candidate'],
    default: 'candidate'
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  tempPasswordExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken:{
    type: String
  },
  resetPasswordExpiry: {
    type: Date
  }
});

module.exports = mongoose.model('User', UserSchema);