const { application } = require('express');
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: ['aadhaar', 'pan', 'degree', 'employment'],
    required: true
  },
  documentName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileData: {
    type: Buffer,
    default: null
  },
  mimeType: {
    type: String,
    enum: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
    default: 'application/pdf'
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
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

documentSchema.pre('save', function(next) {
  if (!this.documentId) {
    this.documentId = `DOC_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema, 'documents');