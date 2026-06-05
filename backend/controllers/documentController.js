const Document = require('../models/Document');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private (Candidate)
exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, documentName } = req.body;
    const candidateId = req.user.id;

    // Validate required fields
    if (!documentType || !documentName) {
      return res.status(400).json({
        success: false,
        message: 'documentType and documentName are required'
      });
    }

    // Validate document type from SRS
    const validTypes = ['aadhaar', 'pan', 'degree', 'employment', 'address'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type. Allowed: aadhaar, pan, degree, employment, address'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Check if document of same type already exists
    const existingDoc = await Document.findOne({
      candidateId,
      documentType
    });

    if (existingDoc) {
      // Delete old file
      if (fs.existsSync(existingDoc.filePath)) {
        fs.unlinkSync(existingDoc.filePath);
      }
      await Document.deleteOne({ _id: existingDoc._id });
    }

    // Create new document record
    const document = await Document.create({
      candidateId,
      documentType,
      documentName,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date(),
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        documentId: document.documentId,
        documentType: document.documentType,
        documentName: document.documentName,
        fileName: document.fileName,
        fileSize: document.fileSize,
        status: document.status,
        uploadDate: document.uploadDate
      }
    });

  } catch (err) {
    // Clean up uploaded file if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all documents for a candidate
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res) => {
  try {
    let query = { candidateId: req.user.id };
    
    // Admin can filter by candidateId
    if (req.user.role === 'admin' && req.query.candidateId) {
      query = { candidateId: req.query.candidateId };
    }

    const documents = await Document.find(query)
      .populate('verifiedBy', 'name email')
      .sort({ uploadDate: -1 });

    // Get verification status summary
    const verificationSummary = {
      total: documents.length,
      pending: documents.filter(d => d.status === 'pending').length,
      verified: documents.filter(d => d.status === 'verified').length,
      rejected: documents.filter(d => d.status === 'rejected').length
    };

    // Group by document type
    const byType = {
      aadhaar: documents.find(d => d.documentType === 'aadhaar') || null,
      pan: documents.find(d => d.documentType === 'pan') || null,
      degree: documents.find(d => d.documentType === 'degree') || null,
      employment: documents.find(d => d.documentType === 'employment') || null,
      address: documents.find(d => d.documentType === 'address') || null
    };

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
      verificationSummary,
      byType
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id })
      .populate('candidateId', 'name email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && document.candidateId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      document
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Download document file
// @route   GET /api/documents/download/:id
// @access  Private
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(document.filePath, document.fileName);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update document (replace with new file)
// @route   PUT /api/documents/:id
// @access  Private (Candidate)
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a new file'
      });
    }

    // Delete old file
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Update document
    document.filePath = req.file.path;
    document.fileName = req.file.filename;
    document.fileSize = req.file.size;
    document.mimeType = req.file.mimetype;
    document.status = 'pending';
    document.rejectionReason = null;
    document.verifiedBy = null;
    document.verifiedAt = null;
    
    await document.save();

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      document: {
        documentId: document.documentId,
        documentType: document.documentType,
        status: document.status,
        updatedAt: document.updatedAt
      }
    });

  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Candidate)
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check authorization
    if (document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await Document.deleteOne({ _id: document._id });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Verify document (Admin only)
// @route   PUT /api/documents/:id/verify
// @access  Private (Admin)
exports.verifyDocument = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const document = await Document.findOne({ documentId: req.params.id });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "verified" or "rejected"'
      });
    }

    document.status = status;
    if (status === 'rejected' && rejectionReason) {
      document.rejectionReason = rejectionReason;
    }
    document.verifiedBy = req.user.id;
    document.verifiedAt = new Date();
    
    await document.save();

    res.status(200).json({
      success: true,
      message: `Document ${status} successfully`,
      document: {
        documentId: document.documentId,
        status: document.status,
        rejectionReason: document.rejectionReason,
        verifiedAt: document.verifiedAt
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};