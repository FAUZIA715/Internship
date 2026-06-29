// models/Document.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const DocumentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    unique: true,  // ✅ This creates an index automatically
    default: () => {
      const timestamp = Date.now().toString(36);
      const random = crypto.randomBytes(6).toString('hex');
      return `DOC_${timestamp}_${random}`;
    }
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // ✅ Keep this one
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
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  verifiedBy: {
    type: String,
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
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
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ✅ Indexes - REMOVED duplicate documentId index
DocumentSchema.index({ candidateId: 1, documentType: 1 });
// DocumentSchema.index({ documentId: 1 }); // ❌ REMOVED - duplicate (unique: true already creates it)
DocumentSchema.index({ status: 1 });

module.exports = mongoose.models.Document || mongoose.model('Document', DocumentSchema);