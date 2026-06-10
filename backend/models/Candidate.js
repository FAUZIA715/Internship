const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  positionApplied: { type: String, required: true },
  department: { type: String, default: 'Engineering' },
  dateOfBirth: { type: Date },
  address: { type: String },
  joiningDate: { type: Date },
  
  documents: {
    aadhaar: { type: String, default: null },
    pan: { type: String, default: null },
    degree: { type: String, default: null },
    employment: { type: String, default: null },
    address: { type: String, default: null }
  },
  
  autoVerification: {
    aadhaar: { type: String, default: 'Pending' },
    pan: { type: String, default: 'Pending' },
    address: { type: String, default: 'Pending' }
  },
  
  degreeStatus: { type: String, default: 'Pending' },
  employmentStatus: { type: String, default: 'Pending' },
  hrReviewStatus: { type: String, default: 'Pending' },
  reportGenerated: { type: Boolean, default: false },
  reportUrl: { type: String, default: null },
  
  verificationHistory: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);