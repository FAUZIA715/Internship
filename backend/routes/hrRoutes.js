const express = require('express');
const router = express.Router();

// Sample data with different scenarios
let candidates = [
  // Scenario 1: FULLY VERIFIED - All 5 completed
  {
    _id: '1',
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    positionApplied: 'Frontend Developer',
    department: 'Engineering',
    documents: {
      aadhaar: '/uploads/aadhaar.pdf',
      pan: '/uploads/pan.pdf',
      degree: '/uploads/degree.pdf',
      employment: '/uploads/employment.pdf',
      address: '/uploads/address.pdf'
    },
    autoVerification: {
      aadhaar: 'Verified',
      pan: 'Verified',
      address: 'Verified'
    },
    degreeStatus: 'Verified',
    employmentStatus: 'Verified',
    hrReviewStatus: 'Approved',
    reportGenerated: false
  },
  
  // Scenario 2: AUTO DONE, HR PENDING - Waiting for HR manual verification
  {
    _id: '2',
    fullName: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9876543211',
    positionApplied: 'Backend Developer',
    department: 'Engineering',
    documents: {
      aadhaar: '/uploads/aadhaar.pdf',
      pan: '/uploads/pan.pdf',
      degree: '/uploads/degree.pdf',
      employment: '/uploads/employment.pdf',
      address: '/uploads/address.pdf'
    },
    autoVerification: {
      aadhaar: 'Verified',
      pan: 'Verified',
      address: 'Verified'
    },
    degreeStatus: 'Pending',
    employmentStatus: 'Pending',
    hrReviewStatus: 'Pending',
    reportGenerated: false
  },
  
  // Scenario 3: AUTO PENDING - Documents uploaded but auto verification not done yet
  {
    _id: '3',
    fullName: 'Varun Dhawan',
    email: 'varun@example.com',
    phone: '9876543221',
    positionApplied: 'Sales Executive',
    department: 'Sales',
    documents: {
      aadhaar: '/uploads/aadhaar.pdf',
      pan: '/uploads/pan.pdf',
      degree: '/uploads/degree.pdf',
      employment: '/uploads/employment.pdf',
      address: '/uploads/address.pdf'
    },
    autoVerification: {
      aadhaar: 'Pending',
      pan: 'Pending',
      address: 'Pending'
    },
    degreeStatus: 'Pending',
    employmentStatus: 'Pending',
    hrReviewStatus: 'Pending',
    reportGenerated: false
  },
  
  // Scenario 4: DOCUMENTS MISSING - Some documents not uploaded
  {
    _id: '4',
    fullName: 'Neha Gupta',
    email: 'neha@example.com',
    phone: '9876543222',
    positionApplied: 'UI/UX Designer',
    department: 'Design',
    documents: {
      aadhaar: '/uploads/aadhaar.pdf',
      pan: '/uploads/pan.pdf',
      degree: null,
      employment: null,
      address: '/uploads/address.pdf'
    },
    autoVerification: {
      aadhaar: 'Verified',
      pan: 'Verified',
      address: 'Verified'
    },
    degreeStatus: 'Pending',
    employmentStatus: 'Pending',
    hrReviewStatus: 'Pending',
    reportGenerated: false
  },
  
  // Scenario 5: REJECTED - Document was rejected
  {
    _id: '5',
    fullName: 'Amit Kumar',
    email: 'amit@example.com',
    phone: '9876543223',
    positionApplied: 'Product Manager',
    department: 'Product',
    documents: {
      aadhaar: '/uploads/aadhaar.pdf',
      pan: '/uploads/pan.pdf',
      degree: '/uploads/degree.pdf',
      employment: '/uploads/employment.pdf',
      address: '/uploads/address.pdf'
    },
    autoVerification: {
      aadhaar: 'Verified',
      pan: 'Verified',
      address: 'Verified'
    },
    degreeStatus: 'Rejected',
    employmentStatus: 'Rejected',
    hrReviewStatus: 'Rejected',
    reportGenerated: false
  }
];

// GET all candidates
router.get('/candidates', (req, res) => {
  res.json(candidates);
});

// GET single candidate
router.get('/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c._id === req.params.id);
  if (candidate) {
    res.json(candidate);
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
});

// POST sample data
router.post('/sample-data', (req, res) => {
  candidates = [
    {
      _id: '1',
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      positionApplied: 'Frontend Developer',
      department: 'Engineering',
      documents: {
        aadhaar: '/uploads/aadhaar.pdf',
        pan: '/uploads/pan.pdf',
        degree: '/uploads/degree.pdf',
        employment: '/uploads/employment.pdf',
        address: '/uploads/address.pdf'
      },
      autoVerification: {
        aadhaar: 'Verified',
        pan: 'Verified',
        address: 'Verified'
      },
      degreeStatus: 'Verified',
      employmentStatus: 'Verified',
      hrReviewStatus: 'Approved',
      reportGenerated: false
    },
    {
      _id: '2',
      fullName: 'Priya Patel',
      email: 'priya@example.com',
      phone: '9876543211',
      positionApplied: 'Backend Developer',
      department: 'Engineering',
      documents: {
        aadhaar: '/uploads/aadhaar.pdf',
        pan: '/uploads/pan.pdf',
        degree: '/uploads/degree.pdf',
        employment: '/uploads/employment.pdf',
        address: '/uploads/address.pdf'
      },
      autoVerification: {
        aadhaar: 'Verified',
        pan: 'Verified',
        address: 'Verified'
      },
      degreeStatus: 'Pending',
      employmentStatus: 'Pending',
      hrReviewStatus: 'Pending',
      reportGenerated: false
    },
    {
      _id: '3',
      fullName: 'Varun Dhawan',
      email: 'varun@example.com',
      phone: '9876543221',
      positionApplied: 'Sales Executive',
      department: 'Sales',
      documents: {
        aadhaar: '/uploads/aadhaar.pdf',
        pan: '/uploads/pan.pdf',
        degree: '/uploads/degree.pdf',
        employment: '/uploads/employment.pdf',
        address: '/uploads/address.pdf'
      },
      autoVerification: {
        aadhaar: 'Pending',
        pan: 'Pending',
        address: 'Pending'
      },
      degreeStatus: 'Pending',
      employmentStatus: 'Pending',
      hrReviewStatus: 'Pending',
      reportGenerated: false
    },
    {
      _id: '4',
      fullName: 'Neha Gupta',
      email: 'neha@example.com',
      phone: '9876543222',
      positionApplied: 'UI/UX Designer',
      department: 'Design',
      documents: {
        aadhaar: '/uploads/aadhaar.pdf',
        pan: '/uploads/pan.pdf',
        degree: null,
        employment: null,
        address: '/uploads/address.pdf'
      },
      autoVerification: {
        aadhaar: 'Verified',
        pan: 'Verified',
        address: 'Verified'
      },
      degreeStatus: 'Pending',
      employmentStatus: 'Pending',
      hrReviewStatus: 'Pending',
      reportGenerated: false
    },
    {
      _id: '5',
      fullName: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '9876543223',
      positionApplied: 'Product Manager',
      department: 'Product',
      documents: {
        aadhaar: '/uploads/aadhaar.pdf',
        pan: '/uploads/pan.pdf',
        degree: '/uploads/degree.pdf',
        employment: '/uploads/employment.pdf',
        address: '/uploads/address.pdf'
      },
      autoVerification: {
        aadhaar: 'Verified',
        pan: 'Verified',
        address: 'Verified'
      },
      degreeStatus: 'Rejected',
      employmentStatus: 'Rejected',
      hrReviewStatus: 'Rejected',
      reportGenerated: false
    }
  ];
  
  res.json({ 
    message: 'Sample data added with different scenarios', 
    count: candidates.length
  });
});

// PUT update degree
router.put('/candidates/:id/update-degree', (req, res) => {
  const candidate = candidates.find(c => c._id === req.params.id);
  if (candidate) {
    candidate.degreeStatus = req.body.status;
    
    // Update HR status based on both manual verifications
    if (candidate.degreeStatus === 'Verified' && candidate.employmentStatus === 'Verified') {
      candidate.hrReviewStatus = 'Approved';
    } else if (candidate.degreeStatus === 'Rejected' || candidate.employmentStatus === 'Rejected') {
      candidate.hrReviewStatus = 'Rejected';
    } else {
      candidate.hrReviewStatus = 'Pending';
    }
    
    res.json({ message: `Degree updated to ${req.body.status}`, candidate });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
});

// PUT update employment
router.put('/candidates/:id/update-employment', (req, res) => {
  const candidate = candidates.find(c => c._id === req.params.id);
  if (candidate) {
    candidate.employmentStatus = req.body.status;
    
    // Update HR status based on both manual verifications
    if (candidate.degreeStatus === 'Verified' && candidate.employmentStatus === 'Verified') {
      candidate.hrReviewStatus = 'Approved';
    } else if (candidate.degreeStatus === 'Rejected' || candidate.employmentStatus === 'Rejected') {
      candidate.hrReviewStatus = 'Rejected';
    } else {
      candidate.hrReviewStatus = 'Pending';
    }
    
    res.json({ message: `Employment updated to ${req.body.status}`, candidate });
  } else {
    res.status(404).json({ message: 'Candidate not found' });
  }
});

module.exports = router;