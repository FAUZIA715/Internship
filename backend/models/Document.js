const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  documentId: {
  type: String,
  unique: true,  // ← This creates an index
  default: () => 'DOC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
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



module.exports = mongoose.model('Document', DocumentSchema);