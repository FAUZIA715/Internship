const Document = require('../models/document');
const User = require('../models/User');
const { cloudinary } = require('../middleware/upload');
const logHistory = require('../utils/historyLogger');

// ─── Helper: extract Cloudinary public_id from URL ────────────────
const getPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Skip version segment if present (v1234567890)
    let startIndex = uploadIndex + 1;
    if (parts[startIndex] && parts[startIndex].startsWith('v')) startIndex++;
    const pathWithExt = parts.slice(startIndex).join('/');
    return pathWithExt.replace(/\.[^/.]+$/, ''); // remove extension
  } catch { return null; }
};

// ─── Upload Document ──────────────────────────────────────────────
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

    // Cloudinary URL is in req.file.path
    const cloudinaryUrl = req.file.path;
    const fileName = req.file.filename || req.file.originalname;

    // Check for existing document
    const existingDoc = await Document.findOne({ candidateId, documentType });

    if (existingDoc) {
      // Delete old file from Cloudinary
      const oldPublicId = getPublicId(existingDoc.filePath);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' }).catch(() => {});
      }

      existingDoc.filePath = cloudinaryUrl;
      existingDoc.fileName = fileName;
      existingDoc.fileSize = req.file.size;
      existingDoc.mimeType = req.file.mimetype;
      existingDoc.status = 'pending';
      existingDoc.rejectionReason = null;
      existingDoc.verifiedBy = null;
      existingDoc.verifiedAt = null;
      existingDoc.uploadDate = new Date();

      await existingDoc.save();

      await logHistory({
        candidateId, documentId: existingDoc._id, documentType, documentName,
        action: 'UPDATED', status: 'pending',
        performedBy: req.user.id, performedByRole: req.user.role, performedByName: req.user.name,
        details: `File updated on Cloudinary`, req
      });

      return res.status(200).json({ success: true, message: 'Document updated successfully', document: existingDoc });
    }

    // Create new document
    const document = await Document.create({
      candidateId, documentType, documentName,
      filePath: cloudinaryUrl,
      fileName: fileName,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'pending'
    });

    await logHistory({
      candidateId, documentId: document._id, documentType, documentName,
      action: 'UPLOADED', status: 'pending',
      performedBy: req.user.id, performedByRole: req.user.role, performedByName: req.user.name,
      details: `File uploaded to Cloudinary`, req
    });

    res.status(201).json({ success: true, message: 'Document uploaded successfully', document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All Documents ────────────────────────────────────────────
exports.getDocuments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'candidate') {
      query.candidateId = req.user.id;
    } else if (req.query.candidateId) {
      query.candidateId = req.query.candidateId;
    }
    const documents = await Document.find(query).populate('verifiedBy', 'name').sort({ uploadDate: -1 });
    res.status(200).json({ success: true, documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Single Document ──────────────────────────────────────────
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate('candidateId', 'name email');
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (req.user.role === 'candidate' && document.candidateId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.status(200).json({ success: true, document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Download Document (redirect to Cloudinary URL) ──────────────
exports.downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (req.user.role === 'candidate' && document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await logHistory({
      candidateId: document.candidateId, documentId: document._id,
      documentType: document.documentType, documentName: document.documentName,
      action: 'VIEWED', status: document.status,
      performedBy: req.user.id, performedByRole: req.user.role, performedByName: req.user.name,
      details: 'Document viewed', req
    });

    // Redirect to Cloudinary URL — accessible from any machine
    res.redirect(document.filePath);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Update Document ──────────────────────────────────────────────
exports.updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a new file' });

    // Delete old file from Cloudinary
    const oldPublicId = getPublicId(document.filePath);
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId, { resource_type: 'raw' }).catch(() => {});
    }

    const previousStatus = document.status;
    document.filePath = req.file.path;
    document.fileName = req.file.filename || req.file.originalname;
    document.fileSize = req.file.size;
    document.status = 'pending';
    document.rejectionReason = null;
    document.verifiedBy = null;
    document.verifiedAt = null;
    await document.save();

    await logHistory({
      candidateId: document.candidateId, documentId: document._id,
      documentType: document.documentType, documentName: document.documentName,
      action: 'UPDATED', status: 'pending', previousStatus,
      performedBy: req.user.id, performedByRole: req.user.role, performedByName: req.user.name,
      details: 'File updated on Cloudinary', req
    });

    res.status(200).json({ success: true, message: 'Document updated successfully', document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Delete Document ──────────────────────────────────────────────
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    if (req.user.role !== 'hr' && document.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Delete from Cloudinary
    const publicId = getPublicId(document.filePath);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch(() => {});
    }

    await logHistory({
      candidateId: document.candidateId, documentId: document._id,
      documentType: document.documentType, documentName: document.documentName,
      action: 'DELETED', status: document.status,
      performedBy: req.user.id, performedByRole: req.user.role, performedByName: req.user.name,
      details: 'Document deleted from Cloudinary', req
    });

    await Document.deleteOne({ _id: document._id });
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Verify Document (HR only) ────────────────────────────────────
exports.verifyDocument = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

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
      candidateId: document.candidateId, documentId: document._id,
      documentType: document.documentType, documentName: document.documentName,
      action: status === 'verified' ? 'VERIFIED' : 'REJECTED',
      status, previousStatus,
      performedBy: req.user.id, performedByRole: req.user.role, performedByName: req.user.name,
      details: rejectionReason || `Document marked as ${status}`, req
    });

    res.status(200).json({ success: true, message: `Document ${status} successfully`, document });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All Candidates Status (HR) ──────────────────────────────
exports.getAllCandidatesStatus = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).select('_id name email phone createdAt');
    const candidateData = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
      const statusMap = {
        aadhaar: documents.find(d => d.documentType === 'aadhaar')?.status || 'not_uploaded',
        pan: documents.find(d => d.documentType === 'pan')?.status || 'not_uploaded',
        degree: documents.find(d => d.documentType === 'degree')?.status || 'not_uploaded',
        employment: documents.find(d => d.documentType === 'employment')?.status || 'not_uploaded',
      };
      const allVerified = Object.values(statusMap).every(s => s === 'verified');
      return { ...candidate.toObject(), documents: statusMap, overallStatus: allVerified ? 'verified' : 'pending' };
    }));
    res.status(200).json({ success: true, candidates: candidateData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Candidate Details (HR) ───────────────────────────────────
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

// ─── Get Document History ─────────────────────────────────────────
exports.getDocumentHistory = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const History = require('../models/History');
    if (req.user.role === 'candidate' && candidateId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const history = await History.find({ candidateId }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
