const express = require('express');
const {
  registerCandidate,
  getCandidateByEmail,
  updateCandidate,
  getVerificationStatus,
  getAllCandidates,
  updateVerificationStatus,
  deleteCandidate,
  downloadResume,
  viewResume,
  uploadResume
} = require('../controllers/candidateController');

const router = express.Router();

// ========== IMPORTANT: Put specific routes BEFORE generic ones ==========

// View resume in browser (specific route)
router.get('/view-resume/:email', viewResume);

// Download resume
router.get('/resume/:email', downloadResume);

// Register candidate (with file upload)
router.post('/register', uploadResume, registerCandidate);

// Get all candidates
router.get('/', getAllCandidates);

// Get verification status (specific route)
router.get('/verification-status/:email', getVerificationStatus);

// Update verification status
router.put('/verification/:email', updateVerificationStatus);

// Update candidate profile
router.put('/update/:email', updateCandidate);

// Delete candidate
router.delete('/:email', deleteCandidate);

// Get candidate by email (generic route - MUST BE LAST)
router.get('/:email', getCandidateByEmail);

module.exports = router;