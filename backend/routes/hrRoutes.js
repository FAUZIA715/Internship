const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Document = require('../models/document');
const Report = require('../models/report');
const path = require('path');
const fs = require('fs');

const { protect, authorize } = require('../middleware/authMiddleware');

// ─── GET all candidates ───────────────────────────────────────────
router.get('/candidates', protect, authorize('hr'), async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).sort({ createdAt: -1 });
    const candidatesWithDocs = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
         // const report = await Report.findOne({ candidateId: candidate._id });
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
        employmentStatus: docsMap.employment?.status || 'not_uploaded',
      };
    }));
    
    res.json(candidatesWithDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET single candidate ─────────────────────────────────────────
router.get('/candidates/:id', protect, authorize('hr'), async (req, res) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'candidate' });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    const documents = await Document.find({ candidateId: candidate._id });
    const report = await Report.findLast({ candidateId: candidate._id });
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
      employmentStatus: docsMap.employment?.status || 'not_uploaded',
      reportId: report ? report._id : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE DOCUMENT STATUS ───────────────────────────────────────
router.put('/candidates/:id/update-document/:docType', protect, authorize('hr'), async (req, res) => {
  try {
    const { id, docType } = req.params;
    const { status } = req.body;

    // Check if document type is valid
    const allowedTypes = ['aadhaar', 'pan', 'degree', 'employment'];
    if (!allowedTypes.includes(docType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid document type. Allowed: ${allowedTypes.join(', ')}`
      });
    }

    // Find the document
    const doc = await Document.findOne({ 
      candidateId: id, 
      documentType: docType 
    });
    
    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: `${docType} document not found` 
      });
    }

    // Prepare update data
    let updateData = {
      status: status,
      verifiedBy: 'HR'
    };

    if (status === 'verified') {
      updateData.verifiedAt = new Date();
      updateData.rejectionReason = null;
    } else if (status === 'rejected') {
      updateData.status = 'rejected';
      updateData.verifiedAt = null;
      updateData.rejectionReason = `${docType} rejected by HR`;
    } else {
      updateData.status = 'pending';
      updateData.verifiedAt = null;
      updateData.rejectionReason = null;
    }

    // ✅ FIX: Use updateOne instead of save()
    await Document.updateOne(
      { _id: doc._id },
      { $set: updateData }
    );

    console.log(`✅ ${docType} updated to ${status} for candidate ${id}`);

    res.json({
      success: true,
      message: `${docType} status updated to ${status}`
    });

  } catch (err) {
    console.error('❌ Error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});
// ─── VIEW DOCUMENT ──────────────────────────────────────────────────
router.get('/view-document/:documentId', protect, async (req, res) => {
  try {
    const { documentId } = req.params;

    // Find document in MongoDB
    const doc = await Document.findOne({ documentId: documentId });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Document not found in database' 
      });
    }

    // Get file path
    const filePath = doc.filePath;

    if (!filePath) {
      return res.status(404).json({ 
        success: false, 
        message: 'File path not found in database' 
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File does not exist on server' 
      });
    }

    // Send the file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;