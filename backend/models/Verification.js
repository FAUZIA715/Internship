// Purpose: Tracks overall verification progress for each candidate
// Aggregates status from all documents

const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // One verification record per candidate
    index: true
  },
  aadhaarStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'not_uploaded'
  },
  panStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'not_uploaded'
  },
  educationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'not_uploaded'
  },
  employmentStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'not_uploaded'
  },
  addressStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'not_uploaded'
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'partial', 'verified', 'rejected'],
    default: 'pending'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  adminNotes: {
    type: String,
    default: null
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to calculate overall status based on individual document statuses
VerificationSchema.methods.calculateOverallStatus = function() {
  const statuses = [
    this.aadhaarStatus,
    this.panStatus,
    this.educationStatus,
    this.employmentStatus,
    this.addressStatus
  ].filter(s => s !== 'not_uploaded');
  
  if (statuses.length === 0) return 'pending';
  
  const verifiedCount = statuses.filter(s => s === 'verified').length;
  const rejectedCount = statuses.filter(s => s === 'rejected').length;
  
  if (rejectedCount > 0) return 'rejected';
  if (verifiedCount === statuses.length) return 'verified';
  if (verifiedCount > 0) return 'partial';
  return 'pending';
};

// Method to calculate completion percentage
VerificationSchema.methods.calculateCompletion = function() {
  const totalDocs = 5; // Aadhaar, PAN, Degree, Employment, Address
  let completed = 0;
  
  ['aadhaarStatus', 'panStatus', 'educationStatus', 'employmentStatus', 'addressStatus'].forEach(field => {
    if (this[field] === 'verified') completed++;
  });
  
  return Math.round((completed / totalDocs) * 100);
};

module.exports = mongoose.model('Verification', VerificationSchema);