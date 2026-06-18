const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/Document');

// ─── GET all candidates with their documents ──────────────────────
router.get('/candidates', async (req, res) => {
  try {
    // Get all users with role 'candidate'
    const candidates = await User.find({ role: 'candidate' }).sort({ createdAt: -1 });
    
    // For each candidate, get their documents
    const candidatesWithDocs = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
      
      // Group documents by type
      const docsMap = {};
      documents.forEach(doc => {
        docsMap[doc.documentType] = {
          status: doc.status,
          documentName: doc.documentName,
          uploadDate: doc.uploadDate,
          verifiedAt: doc.verifiedAt,
          documentId: doc.documentId
        };
      });
      
      return {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        position: candidate.position || 'N/A',
        documents: docsMap,
        // For backward compatibility
        degreeStatus: docsMap.degree?.status || 'not_uploaded',
        employmentStatus: docsMap.employment?.status || 'not_uploaded',
        aadhaarStatus: docsMap.aadhaar?.status || 'not_uploaded',
        panStatus: docsMap.pan?.status || 'not_uploaded',
        addressStatus: docsMap.address?.status || 'not_uploaded'
      };
    }));
    
    res.json(candidatesWithDocs);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET single candidate with documents ──────────────────────────
router.get('/candidates/:id', async (req, res) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'candidate' });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const documents = await Document.find({ candidateId: candidate._id });
    
    // Group documents by type
    const docsMap = {};
    documents.forEach(doc => {
      docsMap[doc.documentType] = {
        status: doc.status,
        documentName: doc.documentName,
        uploadDate: doc.uploadDate,
        verifiedAt: doc.verifiedAt,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        documentId: doc.documentId,
        rejectionReason: doc.rejectionReason
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
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;