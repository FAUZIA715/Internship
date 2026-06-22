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
  position: {
    type: String,
    default: 'Not specified'
  },
  // ✅ Document verification details (from hr_dashboard_complete)
  documents: [
    {
      documentType: {
        type: String,
        enum: ['aadhaar', 'pan', 'degree', 'employment', 'address']
      },
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'not_uploaded'],
        default: 'not_uploaded'
      },
      documentName: {
        type: String,
        default: null
      },
      uploadDate: {
        type: Date,
        default: null
      },
      verifiedAt: {
        type: Date,
        default: null
      },
      rejectionReason: {
        type: String,
        default: null
      }
    }
  ],
  // ✅ Final decision (from hr_dashboard_complete)
  finalDecision: {
    type: String,
    enum: ['Clear', 'Not Clear', 'Pending'],
    default: 'Pending'
  },
  // ✅ Report file details (from Final_flow)
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
  // ✅ Store full report data as JSON (from Final_flow)
  reportData: {
    type: Object,
    default: {}
  },
  // ✅ Report generation status (from Final_flow)
  status: {
    type: String,
    enum: ['pending', 'generated', 'failed'],
    default: 'pending'
  },
  // ✅ Who generated the report (from Final_flow)
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
  // ✅ Download tracking (from Final_flow)
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
ReportSchema.index({ reportId: 1 });

module.exports = mongoose.model('Report', ReportSchema);