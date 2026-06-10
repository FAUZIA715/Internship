const express = require('express');
const router = express.Router();

// 20 diverse candidates for all departments
let candidates = [
  // Engineering Department
  {
    _id: '1',
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    positionApplied: 'Senior Frontend Developer',
    department: 'Engineering',
    dateOfBirth: '1995-06-15',
    address: 'Mumbai, Maharashtra',
    joiningDate: '2026-01-15',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/rahul.pdf',
    verificationHistory: []
  },
  {
    _id: '2',
    fullName: 'Priya Patel',
    email: 'priya.patel@example.com',
    phone: '9876543211',
    positionApplied: 'Backend Developer',
    department: 'Engineering',
    dateOfBirth: '1996-08-20',
    address: 'Delhi, India',
    joiningDate: '2026-02-10',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/priya.pdf',
    verificationHistory: []
  },
  {
    _id: '3',
    fullName: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    phone: '9876543212',
    positionApplied: 'Full Stack Developer',
    department: 'Engineering',
    dateOfBirth: '1994-03-10',
    address: 'Bangalore, Karnataka',
    joiningDate: '2026-03-05',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: null,
      employment: null,
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Pending', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  {
    _id: '4',
    fullName: 'Neha Singh',
    email: 'neha.singh@example.com',
    phone: '9876543213',
    positionApplied: 'DevOps Engineer',
    department: 'Engineering',
    dateOfBirth: '1997-11-25',
    address: 'Pune, Maharashtra',
    joiningDate: '2026-04-12',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: null
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Pending' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  // Product Department
  {
    _id: '5',
    fullName: 'Vikram Reddy',
    email: 'vikram.reddy@example.com',
    phone: '9876543214',
    positionApplied: 'Product Manager',
    department: 'Product',
    dateOfBirth: '1992-07-30',
    address: 'Hyderabad, Telangana',
    joiningDate: '2026-01-20',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/vikram.pdf',
    verificationHistory: []
  },
  {
    _id: '6',
    fullName: 'Anjali Nair',
    email: 'anjali.nair@example.com',
    phone: '9876543215',
    positionApplied: 'Product Owner',
    department: 'Product',
    dateOfBirth: '1993-12-12',
    address: 'Chennai, Tamil Nadu',
    joiningDate: '2026-02-28',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/anjali.pdf',
    verificationHistory: []
  },
  // Design Department
  {
    _id: '7',
    fullName: 'Karthik S',
    email: 'karthik@example.com',
    phone: '9876543216',
    positionApplied: 'UI/UX Designer',
    department: 'Design',
    dateOfBirth: '1991-09-18',
    address: 'Mumbai, Maharashtra',
    joiningDate: '2026-03-15',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: null,
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Pending', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  {
    _id: '8',
    fullName: 'Swati Mehta',
    email: 'swati.mehta@example.com',
    phone: '9876543217',
    positionApplied: 'Graphic Designer',
    department: 'Design',
    dateOfBirth: '1994-05-05',
    address: 'Ahmedabad, Gujarat',
    joiningDate: '2026-04-01',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/swati.pdf',
    verificationHistory: []
  },
  // Sales Department
  {
    _id: '9',
    fullName: 'Rohit Verma',
    email: 'rohit.verma@example.com',
    phone: '9876543218',
    positionApplied: 'Sales Manager',
    department: 'Sales',
    dateOfBirth: '1995-02-28',
    address: 'Noida, UP',
    joiningDate: '2026-01-10',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: null,
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Pending', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  {
    _id: '10',
    fullName: 'Divya Iyer',
    email: 'divya.iyer@example.com',
    phone: '9876543219',
    positionApplied: 'Sales Executive',
    department: 'Sales',
    dateOfBirth: '1996-08-14',
    address: 'Kochi, Kerala',
    joiningDate: '2026-02-20',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/divya.pdf',
    verificationHistory: []
  },
  // HR Department
  {
    _id: '11',
    fullName: 'Manisha Gupta',
    email: 'manisha.gupta@example.com',
    phone: '9876543220',
    positionApplied: 'HR Manager',
    department: 'HR',
    dateOfBirth: '1993-09-22',
    address: 'Jaipur, Rajasthan',
    joiningDate: '2026-03-10',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/manisha.pdf',
    verificationHistory: []
  },
  {
    _id: '12',
    fullName: 'Sachin Tendulkar',
    email: 'sachin@example.com',
    phone: '9876543221',
    positionApplied: 'HR Executive',
    department: 'HR',
    dateOfBirth: '1994-11-05',
    address: 'Pune, Maharashtra',
    joiningDate: '2026-04-15',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: null
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Pending' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  // More Engineering
  {
    _id: '13',
    fullName: 'Deepika Padukone',
    email: 'deepika@example.com',
    phone: '9876543222',
    positionApplied: 'Software Engineer',
    department: 'Engineering',
    dateOfBirth: '1997-01-15',
    address: 'Bangalore, Karnataka',
    joiningDate: '2026-05-01',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/deepika.pdf',
    verificationHistory: []
  },
  {
    _id: '14',
    fullName: 'Ranveer Singh',
    email: 'ranveer@example.com',
    phone: '9876543223',
    positionApplied: 'Frontend Developer',
    department: 'Engineering',
    dateOfBirth: '1995-07-22',
    address: 'Mumbai, Maharashtra',
    joiningDate: '2026-05-10',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: null,
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  {
    _id: '15',
    fullName: 'Alia Bhatt',
    email: 'alia@example.com',
    phone: '9876543224',
    positionApplied: 'Product Designer',
    department: 'Design',
    dateOfBirth: '1996-03-15',
    address: 'Delhi, India',
    joiningDate: '2026-05-20',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/alia.pdf',
    verificationHistory: []
  },
  {
    _id: '16',
    fullName: 'Varun Dhawan',
    email: 'varun@example.com',
    phone: '9876543225',
    positionApplied: 'Sales Executive',
    department: 'Sales',
    dateOfBirth: '1994-04-24',
    address: 'Chandigarh',
    joiningDate: '2026-06-01',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  {
    _id: '17',
    fullName: 'Kriti Sanon',
    email: 'kriti@example.com',
    phone: '9876543226',
    positionApplied: 'HR Recruiter',
    department: 'HR',
    dateOfBirth: '1995-07-27',
    address: 'Bhopal',
    joiningDate: '2026-06-05',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/kriti.pdf',
    verificationHistory: []
  },
  {
    _id: '18',
    fullName: 'Rajkummar Rao',
    email: 'rajkummar@example.com',
    phone: '9876543227',
    positionApplied: 'Product Analyst',
    department: 'Product',
    dateOfBirth: '1993-08-31',
    address: 'Gurgaon',
    joiningDate: '2026-06-08',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: null,
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Pending', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  },
  {
    _id: '19',
    fullName: 'Bhumi Pednekar',
    email: 'bhumi@example.com',
    phone: '9876543228',
    positionApplied: 'Backend Developer',
    department: 'Engineering',
    dateOfBirth: '1992-09-09',
    address: 'Lucknow',
    joiningDate: '2026-06-10',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: '/uploads/documents/sample.pdf',
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Verified', address: 'Verified' },
    hrReviewStatus: 'Approved',
    reportGenerated: true,
    reportUrl: '/reports/bhumi.pdf',
    verificationHistory: []
  },
  {
    _id: '20',
    fullName: 'Ayushmann Khurrana',
    email: 'ayushmann@example.com',
    phone: '9876543229',
    positionApplied: 'DevOps Engineer',
    department: 'Engineering',
    dateOfBirth: '1991-11-14',
    address: 'Chandigarh',
    joiningDate: '2026-06-12',
    documents: {
      aadhaar: '/uploads/documents/sample.pdf',
      pan: '/uploads/documents/sample.pdf',
      degree: '/uploads/documents/sample.pdf',
      employment: null,
      address: '/uploads/documents/sample.pdf'
    },
    autoVerification: { aadhaar: 'Verified', pan: 'Verified', degree: 'Verified', employment: 'Pending', address: 'Verified' },
    hrReviewStatus: 'Pending',
    reportGenerated: false,
    reportUrl: null,
    verificationHistory: []
  }
];
// Add more candidates as needed...

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

// PUT - Update Degree Status (HR Manual)
router.put('/candidates/:id/update-degree', (req, res) => {
  const { status } = req.body;
  const candidate = candidates.find(c => c._id === req.params.id);
  
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  
  candidate.degreeStatus = status;
  
  // Add to history
  candidate.verificationHistory = candidate.verificationHistory || [];
  candidate.verificationHistory.unshift({
    document: 'Degree Certificate',
    status: status,
    by: 'HR Administrator',
    date: new Date()
  });
  
  res.json({ message: `Degree status updated to ${status}`, candidate });
});

// PUT - Update Employment Status (HR Manual)
router.put('/candidates/:id/update-employment', (req, res) => {
  const { status } = req.body;
  const candidate = candidates.find(c => c._id === req.params.id);
  
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  
  candidate.employmentStatus = status;
  
  // Add to history
  candidate.verificationHistory = candidate.verificationHistory || [];
  candidate.verificationHistory.unshift({
    document: 'Employment Proof',
    status: status,
    by: 'HR Administrator',
    date: new Date()
  });
  
  res.json({ message: `Employment status updated to ${status}`, candidate });
});

// POST - Generate Report
router.post('/candidates/:id/generate-report', (req, res) => {
  const candidate = candidates.find(c => c._id === req.params.id);
  if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
  
  candidate.reportGenerated = true;
  candidate.reportUrl = `/reports/${candidate._id}.pdf`;
  
  res.json({ message: 'Report generated successfully', reportUrl: candidate.reportUrl });
});

module.exports = router;