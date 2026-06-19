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
          verifiedAt: doc.verifiedAt,
          filePath: doc.filePath,
          fileName: doc.fileName,
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
        aadhaarStatus: docsMap.aadhaar?.status || 'not_uploaded',
        panStatus: docsMap.pan?.status || 'not_uploaded',
        degreeStatus: docsMap.degree?.status || 'not_uploaded',
        employmentStatus: docsMap.employment?.status || 'not_uploaded'
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
        verifiedAt: doc.verifiedAt,
        filePath: doc.filePath,
        fileName: doc.fileName,
        documentId: doc.documentId
      };
    });
    
    res.json({
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      role: candidate.role,
      position: candidate.position || 'N/A',
      documents: docsMap,
      aadhaarStatus: docsMap.aadhaar?.status || 'not_uploaded',
      panStatus: docsMap.pan?.status || 'not_uploaded',
      degreeStatus: docsMap.degree?.status || 'not_uploaded',
      employmentStatus: docsMap.employment?.status || 'not_uploaded'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE DOCUMENT STATUS ───────────────────────────────────────
router.put('/candidates/:id/update-document/:docType', async (req, res) => {
  try {
    const { id, docType } = req.params;
    const { status } = req.body;

    const allowedTypes = ['aadhaar', 'pan', 'degree', 'employment'];
    if (!allowedTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Allowed: ${allowedTypes.join(', ')}`
      });
    }

    const doc = await Document.findOne({ candidateId: id, documentType: docType });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: `${docType} document not found` 
      });
    }

    doc.status = status;
    if (status === 'verified') {
      doc.verifiedAt = new Date();
    } else if (status === 'rejected') {
      doc.rejectionReason = `${docType} rejected by HR`;
      doc.verifiedAt = null;
    } else {
      doc.status = 'pending';
      doc.verifiedAt = null;
    }

    await doc.save();

    res.json({
      success: true,
      message: `${docType} status updated to ${status}`,
      document: doc
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;