const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  historyId: {
    type: String,
    unique: true,
    default: () => 'HIST_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // ✅ Keep this one
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true 
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
  action: {
    type: String,
    enum: ['UPLOADED', 'UPDATED', 'DELETED', 'VERIFIED', 'REJECTED', 'VIEWED'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  previousStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: null
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByRole: {
    type: String,
    enum: ['candidate', 'hr', 'admin'],
    required: true
  },
  performedByName: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

HistorySchema.index({ candidateId: 1, timestamp: -1 });
// HistorySchema.index({ documentId: 1 }); // ❌ REMOVED - duplicate (index: true already creates it)
HistorySchema.index({ action: 1 });

module.exports = mongoose.models.History || mongoose.model('History', HistorySchema);