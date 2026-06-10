const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  getAllCandidatesStatus,
  getCandidateDetails
} = require('../controllers/documentController');

// All routes require authentication
router.use(protect);

// Document CRUD operations
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.get('/download/:id', downloadDocument);
router.get('/:id', getDocumentById);
router.put('/:id', upload.single('document'), updateDocument);
router.delete('/:id', deleteDocument);

// HR specific routes
router.get('/hr/candidates', authorize('hr'), getAllCandidatesStatus);
router.get('/hr/candidate/:candidateId', authorize('hr'), getCandidateDetails);
router.put('/:id/verify', authorize('hr'), verifyDocument);

module.exports = router;