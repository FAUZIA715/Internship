const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const hrController = require('../controllers/hrController');

// ─── GET all candidates ───────────────────────────────────────────
router.get('/candidates', protect, authorize('hr'), hrController.getCandidates);

// ─── GET single candidate ─────────────────────────────────────────
router.get('/candidates/:id', protect, authorize('hr'), hrController.getCandidateById);

// ─── UPDATE DOCUMENT STATUS ───────────────────────────────────────
router.put('/candidates/:id/update-document/:docType', protect, authorize('hr'), hrController.updateDocumentStatus);

// ─── VIEW DOCUMENT ──────────────────────────────────────────────────
router.get('/view-document/:documentId', protect, authorize('hr'), hrController.viewDocument);

module.exports = router;
