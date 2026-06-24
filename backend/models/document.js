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
    required: true,
    index: true
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
  // ✅ File storage fields (combined from both branches)
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
    enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    required: true,
    default: 'application/pdf'
  },
  // ✅ Document status tracking
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // ✅ HR verification fields
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  // ✅ Portal verification (for Aadhaar/PAN - from Final_flow)
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
  // ✅ Upload tracking
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
DocumentSchema.index({ candidateId: 1, documentType: 1 });
DocumentSchema.index({ documentId: 1 });
DocumentSchema.index({ status: 1 });

module.exports = mongoose.models.Document || mongoose.model('Document', DocumentSchema);