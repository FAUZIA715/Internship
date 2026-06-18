const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');

// ─── GET all candidates ───────────────────────────────────────────
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).sort({ createdAt: -1 });
    
    const candidatesWithDocs = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
      
      const docsMap = {};
      documents.forEach(doc => {
        docsMap[doc.documentType] = {
          status: doc.status,
          documentName: doc.documentName,
          uploadDate: doc.uploadDate,
          verifiedAt: doc.verifiedAt
        };
      });
      
      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        position: candidate.position || 'N/A',
        documents: docsMap,
        degreeStatus: docsMap.degree?.status || 'not_uploaded',
        employmentStatus: docsMap.employment?.status || 'not_uploaded',
        aadhaarStatus: docsMap.aadhaar?.status || 'not_uploaded',
        panStatus: docsMap.pan?.status || 'not_uploaded',
        addressStatus: docsMap.address?.status || 'not_uploaded'
      };
    }));
    
    res.json(candidatesWithDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET single candidate ─────────────────────────────────────────
router.get('/candidates/:id', async (req, res) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'candidate' });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const documents = await Document.find({ candidateId: candidate._id });
    
    const docsMap = {};
    documents.forEach(doc => {
      docsMap[doc.documentType] = {
        status: doc.status,
        documentName: doc.documentName,
        uploadDate: doc.uploadDate,
        verifiedAt: doc.verifiedAt
      };
    });
    
    res.json({
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      position: candidate.position || 'N/A',
      documents: docsMap,
      degreeStatus: docsMap.degree?.status || 'not_uploaded',
      employmentStatus: docsMap.employment?.status || 'not_uploaded',
      aadhaarStatus: docsMap.aadhaar?.status || 'not_uploaded',
      panStatus: docsMap.pan?.status || 'not_uploaded',
      addressStatus: docsMap.address?.status || 'not_uploaded'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE DEGREE STATUS ─────────────────────────────────────────
router.put('/candidates/:id/update-degree', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the degree document
    const doc = await Document.findOne({ candidateId: id, documentType: 'degree' });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Degree document not found for this candidate' 
      });
    }

    // Update status
    doc.status = status;
    if (status === 'verified') {
      doc.verifiedAt = new Date();
    } else if (status === 'rejected') {
      doc.rejectionReason = 'Degree rejected by HR';
      doc.verifiedAt = null;
    } else {
      doc.status = 'pending';
      doc.verifiedAt = null;
    }

    await doc.save();

    res.json({
      success: true,
      message: `Degree status updated to ${status}`,
      document: doc
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── UPDATE EMPLOYMENT STATUS ─────────────────────────────────────
router.put('/candidates/:id/update-employment', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the employment document
    const doc = await Document.findOne({ candidateId: id, documentType: 'employment' });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employment document not found for this candidate' 
      });
    }

    // Update status
    doc.status = status;
    if (status === 'verified') {
      doc.verifiedAt = new Date();
    } else if (status === 'rejected') {
      doc.rejectionReason = 'Employment rejected by HR';
      doc.verifiedAt = null;
    } else {
      doc.status = 'pending';
      doc.verifiedAt = null;
    }

    await doc.save();

    res.json({
      success: true,
      message: `Employment status updated to ${status}`,
      document: doc
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;