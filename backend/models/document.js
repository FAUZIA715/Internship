// models/Document.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const DocumentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    unique: true,
    default: () => {
      // ✅ Better unique ID generation
      const timestamp = Date.now().toString(36);
      const random = crypto.randomBytes(6).toString('hex');
      return `DOC_${timestamp}_${random}`;
    }
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    required: true,
    enum: ['aadhaar', 'pan', 'degree', 'employment', 'address']
  },
  documentName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  // NEW: Portal verification status (for Aadhaar/PAN)
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
  }
}, {
  timestamps: true
});

DocumentSchema.index({ candidateId: 1, documentType: 1 });

module.exports = mongoose.model('Document', DocumentSchema);