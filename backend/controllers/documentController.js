const Document = require('../models/document');
const User = require('../models/User');
const fs = require('fs');
const logHistory = require('../utils/historyLogger');

// @desc    Upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { documentType, documentName } = req.body;
    const candidateId = req.user.id;

    if (!documentType || !documentName) {
      return res.status(400).json({ success: false, message: 'documentType and documentName are required' });
    }

    const validTypes = ['aadhaar', 'pan', 'degree', 'employment', 'address'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const existingDoc = await Document.findOne({ candidateId, documentType });
    if (existingDoc) {
      if (fs.existsSync(existingDoc.filePath)) fs.unlinkSync(existingDoc.filePath);
      await Document.deleteOne({ _id: existingDoc._id });
    }

    const document = await Document.create({
      candidateId,
      documentType,
      documentName,
      filePath: req.file.path,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending'
    });

    await logHistory({
      candidateId,
      documentId: document._id,
      documentType,
      documentName,
      action: 'UPLOADED',
      status: 'pending',
      performedBy: req.user.id,
      performedByRole: req.user.role,
      performedByName: req.user.name,
      details: `File uploaded: ${req.file.filename}`,
      req
    });

    res.status(201).json({ success: true, message: 'Document uploaded successfully', document });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all documents
exports.getDocuments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'candidate') {
      query.candidateId = req.user.id;
      console.log('Query for candidate:', query);
    } else if (req.query.candidateId) {
      query.candidateId = req.query.candidateId;
    }

    const documents = await Document.find(query).populate('verifiedBy', 'name').sort({ uploadDate: -1 });
    
    console.log(`Found ${documents.length} documents for user ${req.user.id}`);
    console.log('Documents:', documents);
    
    res.status(200).json({ success: true, documents });
  } catch (err) {
    console.error('Get documents error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single document by ID
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id }).populate('candidateId', 'name email');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    
    if (req.user.role === 'candidate' && document.candidateId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Download document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    
    if (req.user.role === 'candidate' && document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    await logHistory({
      candidateId: document.candidateId,
      documentId: document._id,
      documentType: document.documentType,
      documentName: document.documentName,
      action: 'VIEWED',
      status: document.status,
      performedBy: req.user.id,
      performedByRole: req.user.role,
      performedByName: req.user.name,
      details: `Document downloaded`,
      req
    });
    
    res.download(document.filePath, document.fileName);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update document
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    
    if (document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a new file' });
    
    const previousStatus = document.status;
    const oldFileName = document.fileName;
    
    if (fs.existsSync(document.filePath)) fs.unlinkSync(document.filePath);
    
    document.filePath = req.file.path;
    document.fileName = req.file.filename;
    document.fileSize = req.file.size;
    document.status = 'pending';
    document.rejectionReason = null;
    document.verifiedBy = null;
    document.verifiedAt = null;
    await document.save();
    
    await logHistory({
      candidateId: document.candidateId,
      documentId: document._id,
      documentType: document.documentType,
      documentName: document.documentName,
      action: 'UPDATED',
      status: 'pending',
      previousStatus,
      performedBy: req.user.id,
      performedByRole: req.user.role,
      performedByName: req.user.name,
      details: `Updated file: ${req.file.filename} (previous: ${oldFileName})`,
      req
    });
    
    res.status(200).json({ success: true, message: 'Document updated successfully', document });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    
    if (req.user.role !== 'hr' && document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await logHistory({
      candidateId: document.candidateId,
      documentId: document._id,
      documentType: document.documentType,
      documentName: document.documentName,
      action: 'DELETED',
      status: document.status,
      performedBy: req.user.id,
      performedByRole: req.user.role,
      performedByName: req.user.name,
      details: `Document deleted`,
      req
    });
    
    if (fs.existsSync(document.filePath)) fs.unlinkSync(document.filePath);
    await Document.deleteOne({ _id: document._id });
    
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify document (HR only)
exports.verifyDocument = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const document = await Document.findOne({ documentId: req.params.id });
    
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    
    const hrVerifiableTypes = ['degree', 'employment', 'address'];
    if (req.user.role === 'hr' && !hrVerifiableTypes.includes(document.documentType)) {
      return res.status(403).json({ success: false, message: 'HR can only verify degree, employment, and address proofs' });
    }
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "verified" or "rejected"' });
    }
    
    const previousStatus = document.status;
    
    document.status = status;
    if (status === 'rejected' && rejectionReason) document.rejectionReason = rejectionReason;
    document.verifiedBy = req.user.id;
    document.verifiedAt = new Date();
    await document.save();
    
    await logHistory({
      candidateId: document.candidateId,
      documentId: document._id,
      documentType: document.documentType,
      documentName: document.documentName,
      action: status === 'verified' ? 'VERIFIED' : 'REJECTED',
      status: status,
      previousStatus,
      performedBy: req.user.id,
      performedByRole: req.user.role,
      performedByName: req.user.name,
      details: rejectionReason || `Document marked as ${status}`,
      req
    });
    
    res.status(200).json({ success: true, message: `Document ${status} successfully`, document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all candidates with verification status (HR view)
exports.getAllCandidatesStatus = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).select('_id name email phone address createdAt');
    const candidateData = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
      const statusMap = {
        aadhaar: documents.find(d => d.documentType === 'aadhaar')?.status || 'not_uploaded',
        pan: documents.find(d => d.documentType === 'pan')?.status || 'not_uploaded',
        degree: documents.find(d => d.documentType === 'degree')?.status || 'not_uploaded',
        employment: documents.find(d => d.documentType === 'employment')?.status || 'not_uploaded',
        address: documents.find(d => d.documentType === 'address')?.status || 'not_uploaded'
      };
      const allVerified = ['aadhaar', 'pan', 'degree', 'employment', 'address'].every(
        type => statusMap[type] === 'verified'
      );
      return {
        ...candidate.toObject(),
        documents: statusMap,
        overallStatus: allVerified ? 'verified' : 'pending',
        documentsList: documents
      };
    }));
    res.status(200).json({ success: true, candidates: candidateData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get candidate details with documents (HR view)
exports.getCandidateDetails = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const candidate = await User.findById(candidateId).select('-password');
    if (!candidate) return res.status(404).json({ success: false, message: 'Candidate not found' });
    
    const documents = await Document.find({ candidateId }).sort({ uploadDate: -1 });
    res.status(200).json({ success: true, candidate, documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/// @desc    Get document history for a candidate
exports.getDocumentHistory = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const History = require('../models/History');
    
    // Check authorization
    if (req.user.role === 'candidate' && candidateId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const history = await History.find({ candidateId })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: -1 });
    
    res.status(200).json({ success: true, history });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};