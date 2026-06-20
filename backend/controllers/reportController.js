const Report = require('../models/Report');
const Document = require('../models/Document');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// ============ HR FUNCTIONS ============

// @desc    Generate report for a candidate (HR only)
// @route   POST /api/reports/generate
// @access  Private (HR only)
exports.generateReport = async (req, res) => {
  try {
    const { candidateId } = req.body;
    
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }

    // Check if candidate exists
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Check if candidate has all documents verified
    const documents = await Document.find({ candidateId });
    const requiredDocs = ['aadhaar', 'pan', 'degree', 'employment'];
    const docStatus = {};
    
    requiredDocs.forEach(type => {
      const doc = documents.find(d => d.documentType === type);
      docStatus[type] = doc ? doc.status : 'not_uploaded';
    });

    const allVerified = requiredDocs.every(type => docStatus[type] === 'verified');
    const anyRejected = requiredDocs.some(type => docStatus[type] === 'rejected');

    if (!allVerified || anyRejected) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report. All documents must be verified.',
        docStatus
      });
    }

    // Check if report already exists
    const existingReport = await Report.findOne({ 
      candidateId, 
      status: 'generated' 
    });

    if (existingReport) {
      return res.status(200).json({
        success: true,
        message: 'Report already generated',
        report: existingReport
      });
    }

    // Generate report data
    const reportData = {
      reportId: 'RPT_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      generatedAt: new Date().toISOString(),
      candidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone || 'Not provided',
        address: candidate.address || 'Not provided',
        dateOfBirth: candidate.dateOfBirth ? new Date(candidate.dateOfBirth).toLocaleDateString() : 'Not provided',
        position: candidate.position || 'Not specified'
      },
      documents: documents.map(doc => ({
        type: doc.documentType,
        name: doc.documentName,
        status: doc.status,
        uploadedAt: doc.uploadDate,
        verifiedAt: doc.verifiedAt,
        rejectionReason: doc.rejectionReason || null
      })),
      summary: {
        totalDocuments: documents.length,
        verifiedCount: documents.filter(d => d.status === 'verified').length,
        pendingCount: documents.filter(d => d.status === 'pending').length,
        rejectedCount: documents.filter(d => d.status === 'rejected').length,
        overallStatus: allVerified ? 'VERIFIED' : 'PENDING'
      }
    };

    // Create report
    const report = await Report.create({
      candidateId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      reportName: `BGV_Report_${candidate.name.replace(/\s/g, '_')}_${Date.now()}`,
      reportData,
      status: 'generated',
      generatedBy: req.user.id,
      generatedByName: req.user.name,
      generatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      report
    });

  } catch (err) {
    console.error('Generate report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all candidates with report status (HR view)
// @route   GET /api/reports/candidates
// @access  Private (HR only)
exports.getCandidatesReportStatus = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).select('_id name email phone address position');
    
    const candidateData = await Promise.all(candidates.map(async (candidate) => {
      const documents = await Document.find({ candidateId: candidate._id });
      const report = await Report.findOne({ 
        candidateId: candidate._id, 
        status: 'generated' 
      });

      const docStatus = {
        aadhaar: documents.find(d => d.documentType === 'aadhaar')?.status || 'not_uploaded',
        pan: documents.find(d => d.documentType === 'pan')?.status || 'not_uploaded',
        degree: documents.find(d => d.documentType === 'degree')?.status || 'not_uploaded',
        employment: documents.find(d => d.documentType === 'employment')?.status || 'not_uploaded'
      };

      const allVerified = Object.values(docStatus).every(status => status === 'verified');

      return {
        ...candidate.toObject(),
        documents: docStatus,
        reportStatus: report ? 'generated' : 'not_generated',
        reportId: report?.reportId || null,
        reportGeneratedAt: report?.generatedAt || null,
        allVerified
      };
    }));

    res.status(200).json({
      success: true,
      candidates: candidateData
    });

  } catch (err) {
    console.error('Get candidates report status error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============ CANDIDATE FUNCTIONS ============

// @desc    Get all reports for a candidate
// @route   GET /api/reports
// @access  Private (Candidate only)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ 
      candidateId: req.user.id 
    })
    .populate('generatedBy', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports
    });

  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single report by ID (Candidate only)
// @route   GET /api/reports/:id
// @access  Private (Candidate only)
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ 
      reportId: req.params.id,
      candidateId: req.user.id  // ✅ Ensure candidate owns the report
    })
    .populate('generatedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      report
    });

  } catch (err) {
    console.error('Get report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Download report (Candidate only)
// @route   GET /api/reports/download/:id
// @access  Private (Candidate only)
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findOne({ 
      reportId: req.params.id,
      candidateId: req.user.id  // ✅ Ensure candidate owns the report
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (report.status !== 'generated') {
      return res.status(400).json({ success: false, message: 'Report is not ready for download' });
    }

    // ✅ Update download status
    report.isDownloaded = true;
    report.downloadedAt = new Date();
    await report.save();

    // If report has a file path, download it
    if (report.filePath && fs.existsSync(report.filePath)) {
      return res.download(report.filePath, report.fileName || 'report.pdf');
    }

    // If no file exists, send JSON data as a downloadable file
    const jsonData = JSON.stringify(report.reportData, null, 2);
    const jsonBuffer = Buffer.from(jsonData, 'utf-8');
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${report.reportName || 'report'}.json`);
    res.send(jsonBuffer);

  } catch (err) {
    console.error('Download report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Check if candidate has a report
// @route   GET /api/reports/check
// @access  Private (Candidate only)
exports.checkReportStatus = async (req, res) => {
  try {
    const report = await Report.findOne({ 
      candidateId: req.user.id,
      status: 'generated'
    });

    res.status(200).json({
      success: true,
      hasReport: !!report,
      report: report || null
    });

  } catch (err) {
    console.error('Check report status error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};