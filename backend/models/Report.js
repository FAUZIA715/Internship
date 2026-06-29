const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true,  // ✅ This creates an index automatically
    default: () => 'RPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // ✅ Keep this one
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
  finalDecision: {
    type: String,
    enum: ['Clear', 'Not Clear', 'Pending'],
    default: 'Pending'
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

// ✅ Indexes - REMOVED duplicate reportId index
ReportSchema.index({ candidateId: 1, createdAt: -1 });
ReportSchema.index({ status: 1 });
// ReportSchema.index({ reportId: 1 }); // ❌ REMOVED - duplicate (unique: true already creates it)

module.exports = mongoose.models.Report || mongoose.model('Report', ReportSchema);