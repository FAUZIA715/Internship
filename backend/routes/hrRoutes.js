const express = require('express');
const router = express.Router();

// Sample data - Candidates with all required fields
let candidates = [
  {
    _id: '1',
    fullName: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '9876543210',
    positionApplied: 'Frontend Developer',
    dateOfBirth: '1995-06-15',
    address: 'Mumbai, Maharashtra',
    documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Pending', address: 'Verified' },
    degreeStatus: 'Pending',
    comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: [
      { document: 'Aadhaar Card', status: 'Verified', by: 'System', date: new Date('2026-06-01T10:30:00') },
      { document: 'PAN Card', status: 'Verified', by: 'System', date: new Date('2026-06-01T10:31:00') }
    ]
  },
  {
    _id: '2',
    fullName: 'Priya Patel',
    email: 'priya@example.com',
    phone: '9876543211',
    positionApplied: 'Backend Developer',
    dateOfBirth: '1996-08-20',
    address: 'Delhi, India',
    documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    degreeStatus: 'Verified',
    comparisonResults: { nameMatch: 'Match', dobMatch: 'Match', addressMatch: 'Match' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/priya.pdf',
    verificationHistory: [
      { document: 'Aadhaar Card', status: 'Verified', by: 'System', date: new Date('2026-06-02T11:00:00') },
      { document: 'PAN Card', status: 'Verified', by: 'System', date: new Date('2026-06-02T11:01:00') },
      { document: 'Degree Certificate', status: 'Verified', by: 'HR', date: new Date('2026-06-02T14:00:00') }
    ]
  }
];

// GET - Get all candidates
router.get('/candidates', (req, res) => {
  res.json(candidates);
});

// GET - Get single candidate by ID
router.get('/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c._id === req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  res.json(candidate);
});

// PUT - HR updates comparison (Name, DOB, Address Match)
router.put('/candidates/:id/compare', (req, res) => {
  const { nameMatch, dobMatch, addressMatch } = req.body;
  const candidate = candidates.find(c => c._id === req.params.id);
  
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  
  // Update comparison results
  if (nameMatch !== undefined) candidate.comparisonResults.nameMatch = nameMatch;
  if (dobMatch !== undefined) candidate.comparisonResults.dobMatch = dobMatch;
  if (addressMatch !== undefined) candidate.comparisonResults.addressMatch = addressMatch;
  
  // Update overall HR review status based on all three matches
  if (candidate.comparisonResults.nameMatch === 'Match' && 
      candidate.comparisonResults.dobMatch === 'Match' && 
      candidate.comparisonResults.addressMatch === 'Match') {
    candidate.hrReviewStatus = 'Approved';
  } else if (candidate.comparisonResults.nameMatch === 'Mismatch' || 
             candidate.comparisonResults.dobMatch === 'Mismatch' || 
             candidate.comparisonResults.addressMatch === 'Mismatch') {
    candidate.hrReviewStatus = 'Rejected';
  } else {
    candidate.hrReviewStatus = 'Pending';
  }
  
  // Add to verification history
  candidate.verificationHistory.unshift({
    document: 'HR Review',
    status: candidate.hrReviewStatus,
    by: 'HR Administrator',
    date: new Date()
  });
  
  res.json({ message: 'Comparison updated successfully', candidate });
});

// PUT - Verify Degree Certificate
router.put('/candidates/:id/verify-degree', (req, res) => {
  const { status } = req.body;
  const candidate = candidates.find(c => c._id === req.params.id);
  
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  
  candidate.degreeStatus = status;
  candidate.autoVerification.degree = status;
  
  // Add to verification history
  candidate.verificationHistory.unshift({
    document: 'Degree Certificate',
    status: status,
    by: 'HR Administrator',
    date: new Date()
  });
  
  res.json({ message: `Degree ${status === 'Verified' ? 'verified' : 'unverified'} successfully`, candidate });
});

// POST - Generate BGV Report
router.post('/candidates/:id/generate-report', (req, res) => {
  const candidate = candidates.find(c => c._id === req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  
  // Check if candidate is approved by HR
  if (candidate.hrReviewStatus !== 'Approved') {
    return res.status(400).json({ message: 'Cannot generate report. Candidate is not approved by HR yet.' });
  }
  
  candidate.reportGenerated = true;
  candidate.reportUrl = `/reports/${candidate._id}_bgv_report.pdf`;
  
  // Add to verification history
  candidate.verificationHistory.unshift({
    document: 'BGV Report',
    status: 'Generated',
    by: 'HR Administrator',
    date: new Date()
  });
  
  res.json({ message: 'BGV Report generated successfully', reportUrl: candidate.reportUrl });
});

// POST - Add sample data (for testing)
router.post('/sample-data', (req, res) => {
  res.json({ message: 'Sample data ready', count: candidates.length });
});

// POST - Add diverse sample data
router.post('/add-diverse-data', (req, res) => {
  const diverseCandidates = [
    {
      _id: '101',
      fullName: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      positionApplied: 'Frontend Developer',
      dateOfBirth: '1995-06-15',
      address: 'Mumbai, Maharashtra',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
      hrReviewStatus: 'Pending',
      reportGenerated: false,
      reportUrl: null,
      verificationHistory: []
    },
    {
      _id: '102',
      fullName: 'Priya Patel',
      email: 'priya@example.com',
      phone: '9876543211',
      positionApplied: 'Backend Developer',
      dateOfBirth: '1996-08-20',
      address: 'Delhi, India',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Match', dobMatch: 'Match', addressMatch: 'Match' },
      hrReviewStatus: 'Approved',
      reportGenerated: true,
      reportUrl: '/reports/priya.pdf',
      verificationHistory: []
    },
    {
      _id: '103',
      fullName: 'Amit Kumar',
      email: 'amit@example.com',
      phone: '9876543212',
      positionApplied: 'Full Stack Developer',
      dateOfBirth: '1994-03-10',
      address: 'Bangalore, Karnataka',
      documents: { aadhaar: true, pan: true, degree: true, employment: false, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Pending', address: 'Verified' },
      degreeStatus: 'Pending',
      comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
      hrReviewStatus: 'Pending',
      reportGenerated: false,
      reportUrl: null,
      verificationHistory: []
    },
    {
      _id: '104',
      fullName: 'Neha Singh',
      email: 'neha@example.com',
      phone: '9876543213',
      positionApplied: 'UI/UX Designer',
      dateOfBirth: '1997-11-25',
      address: 'Pune, Maharashtra',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: false },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Pending' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
      hrReviewStatus: 'Pending',
      reportGenerated: false,
      reportUrl: null,
      verificationHistory: []
    },
    {
      _id: '105',
      fullName: 'Vikram Reddy',
      email: 'vikram@example.com',
      phone: '9876543214',
      positionApplied: 'DevOps Engineer',
      dateOfBirth: '1992-07-30',
      address: 'Hyderabad, Telangana',
      documents: { aadhaar: true, pan: true, degree: false, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Pending',
      comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
      hrReviewStatus: 'Pending',
      reportGenerated: false,
      reportUrl: null,
      verificationHistory: []
    },
    {
      _id: '106',
      fullName: 'Anjali Nair',
      email: 'anjali@example.com',
      phone: '9876543215',
      positionApplied: 'Product Manager',
      dateOfBirth: '1993-12-12',
      address: 'Chennai, Tamil Nadu',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Match', dobMatch: 'Match', addressMatch: 'Match' },
      hrReviewStatus: 'Approved',
      reportGenerated: true,
      reportUrl: '/reports/anjali.pdf',
      verificationHistory: []
    },
    {
      _id: '107',
      fullName: 'Karthik S',
      email: 'karthik@example.com',
      phone: '9876543216',
      positionApplied: 'Data Scientist',
      dateOfBirth: '1991-09-18',
      address: 'Mumbai, Maharashtra',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Pending', address: 'Verified' },
      degreeStatus: 'Pending',
      comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
      hrReviewStatus: 'Pending',
      reportGenerated: false,
      reportUrl: null,
      verificationHistory: []
    },
    {
      _id: '108',
      fullName: 'Swati Mehta',
      email: 'swati@example.com',
      phone: '9876543217',
      positionApplied: 'HR Manager',
      dateOfBirth: '1994-05-05',
      address: 'Ahmedabad, Gujarat',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Match', dobMatch: 'Match', addressMatch: 'Match' },
      hrReviewStatus: 'Approved',
      reportGenerated: true,
      reportUrl: '/reports/swati.pdf',
      verificationHistory: []
    },
    {
      _id: '109',
      fullName: 'Rohit Verma',
      email: 'rohit@example.com',
      phone: '9876543218',
      positionApplied: 'Software Engineer',
      dateOfBirth: '1995-02-28',
      address: 'Noida, UP',
      documents: { aadhaar: true, pan: false, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Pending', degree: 'Verified', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Pending', dobMatch: 'Pending', addressMatch: 'Pending' },
      hrReviewStatus: 'Pending',
      reportGenerated: false,
      reportUrl: null,
      verificationHistory: []
    },
    {
      _id: '110',
      fullName: 'Divya Iyer',
      email: 'divya@example.com',
      phone: '9876543219',
      positionApplied: 'QA Engineer',
      dateOfBirth: '1996-08-14',
      address: 'Kochi, Kerala',
      documents: { aadhaar: true, pan: true, degree: true, employment: true, address: true },
      autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
      degreeStatus: 'Verified',
      comparisonResults: { nameMatch: 'Match', dobMatch: 'Match', addressMatch: 'Match' },
      hrReviewStatus: 'Approved',
      reportGenerated: true,
      reportUrl: '/reports/divya.pdf',
      verificationHistory: []
    }
  ];

  // Add all candidates
  diverseCandidates.forEach(c => {
    const existing = candidates.find(ex => ex._id === c._id);
    if (!existing) {
      candidates.push(c);
    }
  });

  res.json({ message: 'Added 10 diverse candidates', count: diverseCandidates.length });
});


module.exports = router;