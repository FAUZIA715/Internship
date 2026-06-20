// routes/historyRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDocumentHistory } = require('../controllers/documentController');

// Get document history for a candidate
router.get('/:candidateId', protect, getDocumentHistory);

module.exports = router;