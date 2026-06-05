const Candidate = require('../models/Candidate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==================== MULTER CONFIGURATION FOR RESUME UPLOAD ====================

// Ensure uploads directory exists
const uploadDir = 'uploads/resumes';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX are allowed'), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadResume = upload.single('resume');

// ==================== CONTROLLER FUNCTIONS ====================

// @desc    Register a new candidate (with resume upload)
// @route   POST /api/candidates/register
const registerCandidate = async (req, res) => {
  try {
    const { fullName, dateOfBirth, email, phone, address, positionApplied, experience } = req.body;
    const resumeFile = req.file;
    
    // Check if candidate already exists
    const existing = await Candidate.findOne({ email });
    if (existing) {
      if (resumeFile) {
        fs.unlinkSync(resumeFile.path);
      }
      return res.status(400).json({ message: 'Candidate already exists with this email' });
    }
    
    // Create new candidate
    const candidate = new Candidate({
      fullName,
      dateOfBirth,
      email,
      phone,
      address,
      positionApplied,
      experience,
      resumeUrl: resumeFile ? `/uploads/resumes/${resumeFile.filename}` : null
    });
    
    await candidate.save();
    
    res.status(201).json({
      message: 'Candidate registered successfully',
      candidate: {
        id: candidate._id,
        email: candidate.email,
        fullName: candidate.fullName
      }
    });
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get candidate by email
// @route   GET /api/candidates/:email
const getCandidateByEmail = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ email: req.params.email });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update candidate profile
// @route   PUT /api/candidates/update/:email
const updateCandidate = async (req, res) => {
  try {
    const { fullName, dateOfBirth, phone, address, positionApplied, experience } = req.body;
    
    const updated = await Candidate.findOneAndUpdate(
      { email: req.params.email },
      { fullName, dateOfBirth, phone, address, positionApplied, experience },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json({ message: 'Profile updated successfully', candidate: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get verification status only
// @route   GET /api/candidates/verification-status/:email
const getVerificationStatus = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ email: req.params.email }).select('verificationStatus overallStatus');
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    res.json({
      aadhaar: candidate.verificationStatus.aadhaar,
      pan: candidate.verificationStatus.pan,
      education: candidate.verificationStatus.education,
      employment: candidate.verificationStatus.employment,
      overall: candidate.overallStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all candidates
// @route   GET /api/candidates
const getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().select('-__v').sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update verification status (Admin)
// @route   PUT /api/candidates/verification/:email
const updateVerificationStatus = async (req, res) => {
  try {
    const { aadhaar, pan, education, employment } = req.body;
    const updateData = {};
    
    if (aadhaar) updateData['verificationStatus.aadhaar'] = aadhaar;
    if (pan) updateData['verificationStatus.pan'] = pan;
    if (education) updateData['verificationStatus.education'] = education;
    if (employment) updateData['verificationStatus.employment'] = employment;
    
    const candidate = await Candidate.findOneAndUpdate(
      { email: req.params.email },
      updateData,
      { new: true }
    );
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Calculate overall status based on individual statuses
    const statuses = Object.values(candidate.verificationStatus);
    if (statuses.every(s => s === 'Verified')) {
      candidate.overallStatus = 'Verified';
    } else if (statuses.some(s => s === 'Rejected')) {
      candidate.overallStatus = 'Rejected';
    } else if (statuses.some(s => s === 'Partially Verified')) {
      candidate.overallStatus = 'Partially Verified';
    } else {
      candidate.overallStatus = 'Pending';
    }
    await candidate.save();
    
    res.json({ message: 'Verification status updated', candidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete candidate by email
// @route   DELETE /api/candidates/:email
const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findOneAndDelete({ email: req.params.email });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Delete resume file if exists
    if (candidate.resumeUrl) {
      const filePath = path.join(__dirname, '..', candidate.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Download resume
// @route   GET /api/candidates/resume/:email
const downloadResume = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ email: req.params.email });
    if (!candidate || !candidate.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const filePath = path.join(__dirname, '..', candidate.resumeUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const viewResume = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ email: req.params.email });
    if (!candidate || !candidate.resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    
    const filePath = path.join(__dirname, '..', candidate.resumeUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== EXPORTS ====================

module.exports = {
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
};