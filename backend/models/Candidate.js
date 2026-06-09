const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  positionApplied: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  
  // Document upload status
  documents: {
    aadhaar: { type: Boolean, default: false },
    pan: { type: Boolean, default: false },
    degree: { type: Boolean, default: false },
    employment: { type: Boolean, default: false },
    address: { type: Boolean, default: false }
  },
  
  // Auto verification results
  autoVerification: {
    aadhaar: { type: String, default: 'Pending' },
    pan: { type: String, default: 'Pending' },
    degree: { type: String, default: 'Pending' },
    employment: { type: String, default: 'Pending' },
    address: { type: String, default: 'Pending' }
  },
  
  // HR comparison results
  comparisonResults: {
    nameMatch: { type: String, default: 'Pending' },
    dobMatch: { type: String, default: 'Pending' },
    addressMatch: { type: String, default: 'Pending' }
  },
  
  hrReviewStatus: { type: String, default: 'Pending' },
  reportGenerated: { type: Boolean, default: false },
  reportUrl: { type: String, default: null },
  
  verificationHistory: [
    {
      document: String,
      status: String,
      by: String,
      date: Date
    }
  ],
  
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);