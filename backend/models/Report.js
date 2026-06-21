const mongoose = require('mongoose');
const ReportSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  position: {
    type: String,
    default: 'Not specified'
  },
  documents: [
    {
      documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'degree', 'employment'] // address removed
      },
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
        default: 'not_uploaded'
      },
      uploadDate: {
        type: Date,
        default: null
      },
      verifiedAt: {
        type: Date,
        default: null
      }
    }
  ],
  finalDecision: {
    type: String,
    enum: ['Clear', 'Not Clear', 'Pending'],
    default: 'Pending'
  },
  reportPath: {
    type: String,
    default: null
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);