const express = require('express');
const router = express.Router();
const {
  generateReport,
  getReportByCandidate,
  getAllReports,
  downloadReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// HR generates report for a candidate
router.post('/generate/:candidateId', protect, authorize('hr'), generateReport);

// Get report by candidate ID (candidate sees own, HR sees any)
router.get('/candidate/:candidateId', protect, getReportByCandidate);

// Get all reports (HR only)
router.get('/', protect, authorize('hr'), getAllReports);

// Download PDF
router.get('/download/:reportId', protect, downloadReport);

module.exports = router;