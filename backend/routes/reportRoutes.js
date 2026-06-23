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

// ─── HR Routes ────────────────────────────────────────────────────
router.post('/generate/:candidateId', protect, authorize('hr'), generateReport);
router.get('/candidates', protect, authorize('hr'), getCandidatesReportStatus);

// ─── Shared Routes (both HR and candidate) ────────────────────────
router.get('/download/:id', protect, downloadReport);
router.get('/candidate/:candidateId', protect, getReportById);
router.get('/:id', protect, getReportById);

// ─── Candidate Routes ─────────────────────────────────────────────
router.get('/', protect, authorize('candidate'), getReports);
router.get('/check', protect, authorize('candidate'), checkReportStatus);

module.exports = router;
