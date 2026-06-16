const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'candidate'],  // Added 'hr'
    default: 'candidate'
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  position: {
    type: String  // Job position for candidate
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);