const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['aadhaar', 'pan', 'degree', 'employment', 'address'],
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'pending'
  },
  portalVerified: {
    type: Boolean,
    default: false
  },
  portalVerifiedAt: {
    type: Date,
    default: null
  },
  portalNumber: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  documentId: {
    type: String,
    unique: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Generate unique document ID before saving
documentSchema.pre('save', function(next) {
  if (!this.documentId) {
    this.documentId = `DOC_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema, 'documents');