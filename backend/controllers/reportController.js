const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const htmlPdf = require('html-pdf-node');

// ─── INTEGRATION: Sachi's Document model (Module 2) ──────────────
let Document;
try {
  Document = mongoose.model('Document');
} catch {
  Document = null;
}

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
    employment: 'Employment Proof'
  };
  return labels[type] || type;
};

// ─── Helper: Get final decision ──────────────────────────────────
const getFinalDecision = (documents) => {
  const statuses = documents.map(d => d.status);
  if (statuses.some(s => s === 'rejected')) return 'Not Clear';
  if (statuses.every(s => s === 'verified')) return 'Clear';
  return 'Pending';
};

// ─── Helper: Status badge HTML ───────────────────────────────────
const getStatusBadge = (status) => {
  const map = {
    verified:     { text: '✓ Verified',     color: '#16a34a', bg: '#f0fdf4' },
    rejected:     { text: '✗ Rejected',     color: '#dc2626', bg: '#fef2f2' },
    pending:      { text: '⏳ Pending',     color: '#d97706', bg: '#fffbeb' },
    not_uploaded: { text: '— Not Uploaded', color: '#9ca3af', bg: '#f9fafb' }
  };
  const s = map[status] || map['not_uploaded'];
  return `<span style="color:${s.color};background:${s.bg};padding:2px 8px;border-radius:4px;font-weight:600;font-size:12px;">${s.text}</span>`;
};

// ─── Generate PDF from HTML ───────────────────────────────────────
const generatePDF = async (reportData) => {
  const docTypes = ['aadhaar', 'pan', 'degree', 'employment'];
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
          <tr><td class="label">Position Applied</td><td class="value">${reportData.position}</td></tr>
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

// ─── Generate Report ──────────────────────────────────────────────
// @route   POST /api/reports/generate/:candidateId
// @access  HR only
exports.generateReport = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ success: false, message: 'Invalid candidate ID' });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    if (candidate.role !== 'candidate') {
      return res.status(400).json({ success: false, message: 'User is not a candidate' });
    }

    // ─── Fetch documents from Sachi's Document model ──────────────
    let documents = [];
    if (Document) {
      documents = await Document.find({ candidateId }).sort({ uploadDate: 1 });
    }

    const docTypes = ['aadhaar', 'pan', 'degree', 'employment'];
    const mappedDocs = docTypes.map(type => {
      const doc = documents.find(d => d.documentType === type);
      return {
        documentType: type,
        status: doc?.status || 'not_uploaded',
        uploadDate: doc?.uploadDate || null,
        verifiedAt: doc?.verifiedAt || null
      };
    });

    // ─── Verification Complete Check ──────────────────────────────
    const unprocessed = mappedDocs.filter(
      d => d.status === 'pending' || d.status === 'not_uploaded'
    );

    if (unprocessed.length > 0) {
      const names = unprocessed.map(d => getDocLabel(d.documentType)).join(', ');
      return res.status(400).json({
        success: false,
        message: `Cannot generate report. The following documents are still pending: ${names}. All documents must be verified or rejected before generating the BGV report.`
      });
    }
    // ─────────────────────────────────────────────────────────────

    const finalDecision = getFinalDecision(mappedDocs);

    const reportData = {
      candidateId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      position: candidate.position || 'Not specified',
      documents: mappedDocs,
      finalDecision,
      generatedByName: req.user.name
    };

    const { fileName } = await generatePDF(reportData);

    const report = await Report.create({
      candidateId,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      position: candidate.position || 'Not specified',
      documents: mappedDocs,
      finalDecision,
      reportPath: fileName,
      generatedBy: req.user.id
    });

    try {
      await sendEmail({
        to: candidate.email,
        subject: 'VeriFlow BGV — Your Background Verification Report',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;">
            <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
              <h1 style="color:white;margin:0;font-size:20px;">VeriFlow BGV System</h1>
            </div>
            <h2 style="color:#1f2937;">Your BGV Report is Ready</h2>
            <p style="color:#6b7280;margin:16px 0;">Dear ${candidate.name},<br><br>Your Background Verification Report has been generated.</p>
            <div style="background:${finalDecision === 'Clear' ? '#f0fdf4' : finalDecision === 'Not Clear' ? '#fef2f2' : '#fffbeb'};border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
              <p style="font-size:13px;color:#6b7280;margin:0 0 4px;">Final Decision</p>
              <p style="font-size:20px;font-weight:700;color:${finalDecision === 'Clear' ? '#16a34a' : finalDecision === 'Not Clear' ? '#dc2626' : '#d97706'};margin:0;">${finalDecision.toUpperCase()}</p>
            </div>
            <p style="color:#6b7280;font-size:13px;">Please login to your VeriFlow portal to download the full report.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.log('Report email failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'BGV Report generated successfully',
      report: {
        id: report._id,
        candidateName: report.candidateName,
        finalDecision: report.finalDecision,
        generatedAt: report.generatedAt,
        downloadUrl: `/api/reports/download/${report._id}`
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get Report by Candidate ──────────────────────────────────────
// @route   GET /api/reports/candidate/:candidateId
// @access  Protected
exports.getReportByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (req.user.role === 'candidate' && req.user.id !== candidateId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const report = await Report.findOne({ candidateId }).sort({ generatedAt: -1 });

    if (!report) {
      return res.status(404).json({ success: false, message: 'No report found for this candidate' });
    }

    res.status(200).json({
      success: true,
      report: {
        id: report._id,
        candidateName: report.candidateName,
        candidateEmail: report.candidateEmail,
        position: report.position,
        documents: report.documents,
        finalDecision: report.finalDecision,
        generatedAt: report.generatedAt,
        downloadUrl: `/api/reports/download/${report._id}`
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Get All Reports (HR view) ────────────────────────────────────
// @route   GET /api/reports
// @access  HR only
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ generatedAt: -1 })
      .populate('generatedBy', 'name email');

    res.status(200).json({
      success: true,
      count: reports.length,
      reports: reports.map(r => ({
        id: r._id,
        candidateName: r.candidateName,
        candidateEmail: r.candidateEmail,
        position: r.position,
        finalDecision: r.finalDecision,
        generatedAt: r.generatedAt,
        downloadUrl: `/api/reports/download/${r._id}`
      }))
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Download Report PDF ──────────────────────────────────────────
// @route   GET /api/reports/download/:reportId
// @access  Protected
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (req.user.role === 'candidate' &&
      report.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const filePath = path.join(reportsDir, report.reportPath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Report file not found' });
    }

    res.download(filePath, `BGV_Report_${report.candidateName.replace(/\s+/g, '_')}.pdf`);

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};