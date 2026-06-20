const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,
    default: () => 'RPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  reportName: {
    type: String,
    required: true,
    default: 'Background Verification Report'
  },
  filePath: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  mimeType: {
    type: String,
    default: 'application/pdf'
  },
  reportData: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'generated', 'failed'],
    default: 'pending'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  generatedByName: {
    type: String,
    default: null
  },
  generatedAt: {
    type: Date,
    default: null
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  downloadedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
ReportSchema.index({ candidateId: 1, createdAt: -1 });
ReportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', ReportSchema);