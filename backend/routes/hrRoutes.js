const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// GET - Get all candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET - Get single candidate by ID
router.get('/candidates/:id', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update Degree Status
router.put('/candidates/:id/update-degree', async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    candidate.degreeStatus = status;
    
    // Update HR review status based on both verifications
    if (candidate.degreeStatus === 'Verified' && candidate.employmentStatus === 'Verified') {
      candidate.hrReviewStatus = 'Approved';
    } else if (candidate.degreeStatus === 'Rejected' || candidate.employmentStatus === 'Rejected') {
      candidate.hrReviewStatus = 'Rejected';
    } else {
      candidate.hrReviewStatus = 'Pending';
    }
    
    // Add to verification history
    candidate.verificationHistory.unshift({
      document: 'Degree Certificate',
      status: status,
      by: 'HR Administrator',
      date: new Date()
    });
    
    await candidate.save();
    res.json({ message: `Degree status updated to ${status}`, candidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update Employment Status
router.put('/candidates/:id/update-employment', async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    candidate.employmentStatus = status;
    
    // Update HR review status based on both verifications
    if (candidate.degreeStatus === 'Verified' && candidate.employmentStatus === 'Verified') {
      candidate.hrReviewStatus = 'Approved';
    } else if (candidate.degreeStatus === 'Rejected' || candidate.employmentStatus === 'Rejected') {
      candidate.hrReviewStatus = 'Rejected';
    } else {
      candidate.hrReviewStatus = 'Pending';
    }
    
    // Add to verification history
    candidate.verificationHistory.unshift({
      document: 'Employment Proof',
      status: status,
      by: 'HR Administrator',
      date: new Date()
    });
    
    await candidate.save();
    res.json({ message: `Employment status updated to ${status}`, candidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Generate Report
router.post('/candidates/:id/generate-report', async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    
    if (candidate.hrReviewStatus !== 'Approved') {
      return res.status(400).json({ message: 'Candidate not approved yet' });
    }
    
    candidate.reportGenerated = true;
    candidate.reportUrl = `/reports/${candidate._id}.pdf`;
    await candidate.save();
    
    res.json({ message: 'Report generated successfully', reportUrl: candidate.reportUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add sample data (run once to populate database)
router.post('/sample-data', async (req, res) => {
  try {
    // Clear existing data
    await Candidate.deleteMany({});
    
    const sampleCandidates = [
      {
        fullName: 'Rahul Sharma',
        email: 'rahul@example.com',
        phone: '9876543210',
        positionApplied: 'Frontend Developer',
        department: 'Engineering',
        dateOfBirth: '1995-06-15',
        address: 'Mumbai, Maharashtra',
        documents: {
          aadhaar: '/uploads/sample.pdf',
          pan: '/uploads/sample.pdf',
          degree: '/uploads/sample.pdf',
          employment: '/uploads/sample.pdf',
          address: '/uploads/sample.pdf'
        },
        autoVerification: {
          aadhaar: 'Verified',
          pan: 'Verified',
          address: 'Verified'
        },
        degreeStatus: 'Verified',
        employmentStatus: 'Verified',
        hrReviewStatus: 'Approved',
        reportGenerated: true,
        reportUrl: '/reports/rahul.pdf',
        verificationHistory: [
          { document: 'Aadhaar', status: 'Verified', by: 'System', date: new Date() },
          { document: 'PAN', status: 'Verified', by: 'System', date: new Date() }
        ]
      },
      {
        fullName: 'Priya Patel',
        email: 'priya@example.com',
        phone: '9876543211',
        positionApplied: 'Backend Developer',
        department: 'Engineering',
        dateOfBirth: '1996-08-20',
        address: 'Delhi, India',
        documents: {
          aadhaar: '/uploads/sample.pdf',
          pan: '/uploads/sample.pdf',
          degree: '/uploads/sample.pdf',
          employment: '/uploads/sample.pdf',
          address: '/uploads/sample.pdf'
        },
        autoVerification: {
          aadhaar: 'Verified',
          pan: 'Verified',
          address: 'Verified'
        },
        degreeStatus: 'Verified',
        employmentStatus: 'Verified',
        hrReviewStatus: 'Approved',
        reportGenerated: true,
        reportUrl: '/reports/priya.pdf',
        verificationHistory: []
      },
      {
        fullName: 'Varun Dhawan',
        email: 'varun@example.com',
        phone: '9876543221',
        positionApplied: 'Sales Executive',
        department: 'Sales',
        dateOfBirth: '1994-04-24',
        address: 'Chandigarh',
        documents: {
          aadhaar: '/uploads/sample.pdf',
          pan: '/uploads/sample.pdf',
          degree: '/uploads/sample.pdf',
          employment: '/uploads/sample.pdf',
          address: '/uploads/sample.pdf'
        },
        autoVerification: {
          aadhaar: 'Verified',
          pan: 'Verified',
          address: 'Verified'
        },
        degreeStatus: 'Pending',
        employmentStatus: 'Pending',
        hrReviewStatus: 'Pending',
        reportGenerated: false,
        reportUrl: null,
        verificationHistory: []
      },
      {
        fullName: 'Neha Singh',
        email: 'neha@example.com',
        phone: '9876543222',
        positionApplied: 'UI/UX Designer',
        department: 'Design',
        dateOfBirth: '1997-11-25',
        address: 'Pune, Maharashtra',
        documents: {
          aadhaar: '/uploads/sample.pdf',
          pan: '/uploads/sample.pdf',
          degree: '/uploads/sample.pdf',
          employment: '/uploads/sample.pdf',
          address: null
        },
        autoVerification: {
          aadhaar: 'Verified',
          pan: 'Verified',
          address: 'Pending'
        },
        degreeStatus: 'Pending',
        employmentStatus: 'Pending',
        hrReviewStatus: 'Pending',
        reportGenerated: false,
        reportUrl: null,
        verificationHistory: []
      },
      {
        fullName: 'Anjali Nair',
        email: 'anjali@example.com',
        phone: '9876543223',
        positionApplied: 'Product Manager',
        department: 'Product',
        dateOfBirth: '1993-12-12',
        address: 'Chennai, Tamil Nadu',
        documents: {
          aadhaar: '/uploads/sample.pdf',
          pan: '/uploads/sample.pdf',
          degree: '/uploads/sample.pdf',
          employment: '/uploads/sample.pdf',
          address: '/uploads/sample.pdf'
        },
        autoVerification: {
          aadhaar: 'Verified',
          pan: 'Verified',
          address: 'Verified'
        },
        degreeStatus: 'Verified',
        employmentStatus: 'Verified',
        hrReviewStatus: 'Approved',
        reportGenerated: true,
        reportUrl: '/reports/anjali.pdf',
        verificationHistory: []
      }
    ];
    
    await Candidate.insertMany(sampleCandidates);
    res.json({ message: 'Sample data added successfully', count: sampleCandidates.length });
  } catch (err) {
    console.error('Error adding sample data:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;