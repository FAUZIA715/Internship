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
router.get('/hr/candidates', protect, authorize('hr'), getCandidatesReportStatus);

// ─── Shared Routes ────────────────────────────────────────────────
router.get('/download/:id', protect, downloadReport);

// ─── Candidate Routes ─────────────────────────────────────────────
router.get('/check', protect, checkReportStatus);
router.get('/my-reports', protect, getReports);
router.get('/:id', protect, getReportById);

module.exports = router;
