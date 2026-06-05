const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  positionApplied: { type: String, required: true },
  experience: { type: String, required: true },
  resumeUrl: { type: String, default: null },  // ← ADD THIS LINE
  
  verificationStatus: {
    aadhaar: { type: String, default: 'Pending', enum: ['Pending', 'Verified', 'Rejected'] },
    pan: { type: String, default: 'Pending', enum: ['Pending', 'Verified', 'Rejected'] },
    education: { type: String, default: 'Pending', enum: ['Pending', 'Verified', 'Rejected', 'Partially Verified'] },
    employment: { type: String, default: 'Pending', enum: ['Pending', 'Verified', 'Rejected', 'Partially Verified'] }
  },
  overallStatus: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Verified', 'Rejected', 'Partially Verified']
  }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);