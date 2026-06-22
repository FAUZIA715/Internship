const User = require('../models/user');
const Document = require('../models/document');
const Report = require('../models/report');
const fs = require('fs');

// Builds a map of documentType -> document details for a candidate's documents
const buildDocsMap = (documents) => {
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
  return docsMap;
};

// GET all candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).sort({ createdAt: -1 });
    const candidatesWithDocs = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
      const docsMap = buildDocsMap(documents);

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
};

// GET single candidate
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await User.findOne({ _id: req.params.id, role: 'candidate' });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const documents = await Document.find({ candidateId: candidate._id });
    const latestReport = await Report.findOne({ candidateId: candidate._id }).sort({ createdAt: -1 });
    const docsMap = buildDocsMap(documents);

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
      reportId: latestReport ? latestReport._id : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE DOCUMENT STATUS
exports.updateDocumentStatus = async (req, res) => {
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
};

// VIEW DOCUMENT
exports.viewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const doc = await Document.findOne({ documentId: documentId });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found in database'
      });
    }

    const filePath = doc.filePath;

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File path not found in database'
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File does not exist on server'
      });
    }

    res.sendFile(filePath);

  } catch (error) {
    console.error('Error viewing document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
