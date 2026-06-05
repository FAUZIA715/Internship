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
  verifyDocument
} = require('../controllers/documentController');

// All routes require authentication
router.use(protect);

// Document CRUD operations
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.get('/download/:id', downloadDocument);
router.put('/:id', upload.single('document'), updateDocument);
router.delete('/:id', deleteDocument);

// Admin verification
router.put('/:id/verify', authorize('admin'), verifyDocument);

module.exports = router;