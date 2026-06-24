const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Document = require('../models/document');
const Report = require('../models/Report');
const sendEmail = require('../utils/sendEmail');
const htmlPdf = require('html-pdf-node');

// ─── Ensure reports directory exists ─────────────────────────────
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// ─── Helper: Get document label ──────────────────────────────────
const getDocLabel = (type) => {
  const labels = {
    aadhaar: 'Aadhaar Card',
    pan: 'PAN Card',
    degree: 'Degree Certificate',
    employment: 'Employment Proof',
    address: 'Address Proof'
  };
  return labels[type] || type;
};

// ─── Helper: Get status badge for PDF ────────────────────────────
const getStatusBadge = (status) => {
  const badges = {
    'verified': '<span style="color:#16a34a;font-weight:600;">✅ Verified</span>',
    'rejected': '<span style="color:#dc2626;font-weight:600;">❌ Rejected</span>',
    'pending': '<span style="color:#d97706;font-weight:600;">⏳ Pending</span>',
    'not_uploaded': '<span style="color:#6b7280;font-weight:600;">⬜ Not Uploaded</span>'
  };
  return badges[status] || badges['not_uploaded'];
};

// ─── Helper: Get final decision ──────────────────────────────────
const getFinalDecision = (documents) => {
  const statuses = documents.map(d => d.status);
  if (statuses.some(s => s === 'rejected')) return 'Not Clear';
  if (statuses.every(s => s === 'verified')) return 'Clear';
  return 'Pending';
};

// ─── Generate PDF from HTML ───────────────────────────────────────
const generatePDF = async (reportData) => {
  const docTypes = ['aadhaar', 'pan', 'degree', 'employment', 'address'];
  const decision = reportData.finalDecision;

  const decisionColors = {
    'Clear':     { bg: '#f0fdf4', border: '#86efac', text: '#16a34a' },
    'Not Clear': { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    'Pending':   { bg: '#fffbeb', border: '#fde68a', text: '#d97706' }
  };
  const dc = decisionColors[decision] || decisionColors['Pending'];

  const docRows = docTypes.map((type, i) => {
    const doc = reportData.documents.find(d => d.documentType === type);
    const status = doc?.status || 'not_uploaded';
    const uploadDate = doc?.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-IN') : '—';
    const verifiedDate = doc?.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString('en-IN') : '—';
    const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';

    return `
      <tr style="background:${bg};">
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;">${getDocLabel(type)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;">${getStatusBadge(status)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${uploadDate}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${verifiedDate}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1f2937; background: white; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px 40px; color: white; }
        .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
        .header p { font-size: 13px; opacity: 0.85; }
        .content { padding: 30px 40px; }
        .section-title { font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 6px; margin-top: 24px; }
        .divider { height: 1px; background: #e5e7eb; margin-bottom: 14px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 6px 0; font-size: 13px; vertical-align: top; }
        .info-table .label { font-weight: 700; color: #374151; width: 160px; }
        .info-table .value { color: #6b7280; }
        .doc-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .doc-table th { background: #f3f4f6; padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 700; color: #374151; border: 1px solid #e5e7eb; }
        .doc-table td { border: 1px solid #e5e7eb; }
        .decision-box { background: ${dc.bg}; border: 2px solid ${dc.border}; border-radius: 8px; padding: 16px 20px; margin-bottom: 30px; }
        .decision-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        .decision-value { font-size: 22px; font-weight: 700; color: ${dc.text}; }
        .footer { border-top: 1px solid #e5e7eb; padding: 16px 40px; text-align: center; font-size: 11px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>VeriFlow BGV System</h1>
        <p>Background Verification Report &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      </div>
      <div class="content">
        <div class="section-title">Candidate Information</div>
        <div class="divider"></div>
        <table class="info-table">
          <tr><td class="label">Full Name</td><td class="value">${reportData.candidateName}</td></tr>
          <tr><td class="label">Email Address</td><td class="value">${reportData.candidateEmail}</td></tr>
          <tr><td class="label">Position Applied</td><td class="value">${reportData.position || 'Not specified'}</td></tr>
          <tr><td class="label">Generated By</td><td class="value">${reportData.generatedByName || 'HR Manager'}</td></tr>
          <tr><td class="label">Report Date</td><td class="value">${new Date().toLocaleDateString('en-IN')}</td></tr>
        </table>
        <div class="section-title">Document Verification Status</div>
        <div class="divider"></div>
        <table class="doc-table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Status</th>
              <th>Upload Date</th>
              <th>Verified Date</th>
            </tr>
          </thead>
          <tbody>${docRows}</tbody>
        </table>
        <div class="section-title">Final Decision</div>
        <div class="divider"></div>
        <div class="decision-box">
          <div class="decision-label">BGV FINAL DECISION</div>
          <div class="decision-value">${decision.toUpperCase()}</div>
        </div>
      </div>
      <div class="footer">
        This report is generated by VeriFlow BGV System and is confidential. &nbsp;|&nbsp; Aibi Tech © 2026
      </div>
    </body>
    </html>
  `;

  const fileName = `BGV_Report_${reportData.candidateId}_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);
  const file = { content: html };
  const options = { format: 'A4', margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' } };
  const pdfBuffer = await htmlPdf.generatePdf(file, options);
  fs.writeFileSync(filePath, pdfBuffer);
  return { fileName, filePath };
};

// ============ HR FUNCTIONS ============

// @desc    Generate report for a candidate (HR only)
// @route   POST /api/reports/generate
// @access  Private (HR only)
exports.generateReport = async (req, res) => {
  try {
    const candidateId = req.params.candidateId || req.body.candidateId;
    
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required' });
    }

    // Check if candidate exists
    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (candidate.role !== 'candidate') {
      return res.status(400).json({ success: false, message: 'User is not a candidate' });
    }

    // Fetch documents
    const documents = await Document.find({ candidateId }).sort({ uploadDate: 1 });

    // Check verification status for required documents
    const requiredDocs = ['aadhaar', 'pan', 'degree', 'employment'];
    const docStatus = {};
    let allVerified = true;
    let anyRejected = false;

    requiredDocs.forEach(type => {
      const doc = documents.find(d => d.documentType === type);
      const status = doc ? doc.status : 'not_uploaded';
      docStatus[type] = status;
      if (status !== 'verified') allVerified = false;
      if (status === 'rejected') anyRejected = true;
    });

    // Check if all required docs are uploaded (not just verified)
    const allUploaded = requiredDocs.every(type => docStatus[type] !== 'not_uploaded');

    if (!allUploaded) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report. All required documents must be uploaded.',
        docStatus
      });
    }

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
      // If report exists but no PDF, generate it
      if (!existingReport.filePath || !fs.existsSync(existingReport.filePath)) {
        const reportData = {
          candidateId: candidate._id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          position: candidate.position || 'Not specified',
          generatedByName: req.user.name,
          documents: documents.map(doc => ({
            documentType: doc.documentType,
            status: doc.status,
            uploadDate: doc.uploadDate,
            verifiedAt: doc.verifiedAt
          })),
          finalDecision: getFinalDecision(documents.map(d => ({ status: d.status })))
        };

        const { fileName, filePath } = await generatePDF(reportData);
        existingReport.fileName = fileName;
        existingReport.filePath = filePath;
        await existingReport.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Report already generated',
        report: existingReport
      });
    }

    // Generate report data for PDF
    const reportData = {
      candidateId: candidate._id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      position: candidate.position || 'Not specified',
      generatedByName: req.user.name,
      documents: documents.map(doc => ({
        documentType: doc.documentType,
        status: doc.status,
        uploadDate: doc.uploadDate,
        verifiedAt: doc.verifiedAt
      })),
      finalDecision: getFinalDecision(documents.map(d => ({ status: d.status })))
    };

    // Generate PDF
    const { fileName, filePath } = await generatePDF(reportData);

    // Create report record
    const report = await Report.create({
      candidateId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      finalDecision: reportData.finalDecision,
      reportName: `BGV_Report_${candidate.name.replace(/\s/g, '_')}_${Date.now()}`,
      reportData: {
        ...reportData,
        summary: {
          totalDocuments: documents.length,
          verifiedCount: documents.filter(d => d.status === 'verified').length,
          pendingCount: documents.filter(d => d.status === 'pending').length,
          rejectedCount: documents.filter(d => d.status === 'rejected').length,
          overallStatus: allVerified ? 'VERIFIED' : 'PENDING'
        }
      },
      status: 'generated',
      generatedBy: req.user.id,
      generatedByName: req.user.name,
      generatedAt: new Date(),
      filePath,
      fileName,
      isDownloaded: false
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      report
    });

  } catch (err) {
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
        employment: documents.find(d => d.documentType === 'employment')?.status || 'not_uploaded',
        address: documents.find(d => d.documentType === 'address')?.status || 'not_uploaded'
      };

      const allVerified = ['aadhaar', 'pan', 'degree', 'employment'].every(
        type => docStatus[type] === 'verified'
      );

      const allUploaded = ['aadhaar', 'pan', 'degree', 'employment'].every(
        type => docStatus[type] !== 'not_uploaded'
      );

      return {
        ...candidate.toObject(),
        documents: docStatus,
        reportStatus: report ? 'generated' : 'not_generated',
        reportId: report?.reportId || null,
        reportGeneratedAt: report?.generatedAt || null,
        allVerified,
        allUploaded,
        canGenerateReport: allUploaded && allVerified && !report
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
      candidateId: req.user.id
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
    // Search by _id (works for both HR and candidate)
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Send the PDF file
    if (report.filePath && fs.existsSync(report.filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="BGV_Report_${report.candidateName}.pdf"`);
      return res.download(report.filePath, report.fileName || `BGV_Report.pdf`);
    }

    // Regenerate if file missing
    const documents = await Document.find({ candidateId: report.candidateId });
    const reportData = {
      candidateId: report.candidateId,
      candidateName: report.candidateName,
      candidateEmail: report.candidateEmail,
      position: report.reportData?.position || 'Not specified',
      generatedByName: report.generatedByName || 'HR Manager',
      documents: documents.map(doc => ({
        documentType: doc.documentType,
        status: doc.status,
        uploadDate: doc.uploadDate,
        verifiedAt: doc.verifiedAt
      })),
      finalDecision: report.finalDecision || getFinalDecision(documents.map(d => ({ status: d.status })))
    };

    const { fileName, filePath } = await generatePDF(reportData);
    report.filePath = filePath;
    report.fileName = fileName;
    await report.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BGV_Report_${report.candidateName}.pdf"`);
    return res.download(filePath, fileName);

  } catch (err) {
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