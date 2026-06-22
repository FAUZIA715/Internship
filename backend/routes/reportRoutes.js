const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  generateReport,
  getCandidatesReportStatus,
  getReports,
  getReportById,
  downloadReport,
  checkReportStatus
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

// HR generates report for a candidate
router.post('/generate/:candidateId', protect, generateReport);

// Get report by candidate ID (candidate sees own, HR sees any)
router.get('/candidate/:candidateId', protect, getReportByCandidate);

// ============ HR ROUTES ============
router.post('/generate', protect, authorize('hr'), generateReport);
router.get('/candidates', protect, authorize('hr'), getCandidatesReportStatus);

// ============ CANDIDATE ROUTES ============
router.get('/', protect, authorize('candidate'), getReports);
router.get('/check', protect, authorize('candidate'), checkReportStatus);
router.get('/:id', protect, authorize('candidate'), getReportById);
router.get('/download/:id', protect, authorize('candidate'), downloadReport);

module.exports = router;