const express = require('express');
const router = express.Router();
const {
  submitRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
  checkStatus
} = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/submit', submitRequest);
router.get('/status/:email', checkStatus);

// Admin only routes
router.get('/all', protect, authorize('admin'), getAllRequests);
router.put('/approve/:id', protect, authorize('admin'), approveRequest);
router.put('/reject/:id', protect, authorize('admin'), rejectRequest);

module.exports = router;