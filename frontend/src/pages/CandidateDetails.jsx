import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CandidateDetails.css';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // ✅ Changed back to string
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState('not_uploaded');
  const [panStatus, setPanStatus] = useState('not_uploaded');
  const [degreeStatus, setDegreeStatus] = useState('not_uploaded');
  const [employmentStatus, setEmploymentStatus] = useState('not_uploaded');

  useEffect(() => { fetchCandidate(); }, [id]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setCandidate(data);
      setAadhaarStatus(data.aadhaarStatus || 'not_uploaded');
      setPanStatus(data.panStatus || 'not_uploaded');
      setDegreeStatus(data.degreeStatus || 'not_uploaded');
      setEmploymentStatus(data.employmentStatus || 'not_uploaded');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocument = async (docType, status, setStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-document/${docType}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${docType} status updated to ${status}`);
        fetchCandidate();
        localStorage.setItem('refreshActivities', Date.now().toString());
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage(`❌ Failed to update ${docType}`);
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ─── VIEW DOCUMENT ──────────────────────────────────────────────
  const handleViewDocument = (docType) => {
    if (!candidate) { alert('❌ Candidate data not loaded'); return; }
    const doc = candidate.documents?.[docType];
    if (!doc) { alert(`❌ ${docType} document not uploaded`); return; }
    if (!doc.filePath) { alert(`❌ File path not found`); return; }
    // Open Cloudinary URL directly with inline flag
    let url = doc.filePath;
    if (url.startsWith('http')) {
      // Use Google Docs viewer to display PDF inline
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      window.open(googleViewerUrl, '_blank');
    } else {
      alert('❌ This document was uploaded before Cloudinary. Please ask candidate to re-upload.');
    }
  };

  // ─── GENERATE REPORT ─────────────────────────────────────────────
  const handleGenerateReport = async () => {
    const allVerified = 
      aadhaarStatus === 'verified' &&
      panStatus === 'verified' &&
      degreeStatus === 'verified' &&
      employmentStatus === 'verified';

    if (!allVerified) {
      alert('❌ All documents must be verified first.');
      return;
    }

    setGenerating(true);
    setMessage('⏳ Generating BGV Report...');

    try {
      const token = localStorage.getItem('token');
      
      // ✅ Check if token exists
      if (!token) {
        setMessage('❌ Please login first!');
        setGenerating(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reports/generate/${candidate._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // ✅ Handle unauthorized response
      if (response.status === 401) {
        setMessage('❌ Session expired. Please login again.');
        setTimeout(() => navigate('/hr/login'), 2000);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        const report = data.report;
        const finalDecision = report.reportData?.finalDecision || report.finalDecision || 'Pending';
        setMessage(`✅ Report generated! Decision: ${finalDecision}`);
        setCandidate(prev => ({
          ...prev,
          reportGenerated: true,
          reportId: report._id || report.id
        }));
      } else {
        setMessage(`❌ ${data.message || 'Failed to generate report'}`);
      }
    } catch (error) {
      setMessage('❌ Could not generate report.');
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // ─── DOWNLOAD REPORT ─────────────────────────────────────────────
  const handleDownloadReport = async () => {
    if (!candidate?.reportId) {
      setMessage('❌ No report available.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ Please login first!');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reports/download/${candidate.reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        setMessage('❌ Session expired. Please login again.');
        setTimeout(() => navigate('/hr/login'), 2000);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BGV_Report_${candidate.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage('✅ Download started!');
    } catch (error) {
      setMessage('❌ Download failed');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const getHrStatus = () => {
    if (!candidate) return 'Pending';
    const docs = [aadhaarStatus, panStatus, degreeStatus, employmentStatus];
    if (docs.every(s => s === 'verified')) return 'Approved';
    if (docs.some(s => s === 'rejected')) return 'Rejected';
    return 'Pending';
  };

  const getBadge = (status) => {
    if (status === 'verified') return <span className="badge verified">✅ Verified</span>;
    if (status === 'rejected') return <span className="badge rejected">❌ Rejected</span>;
    if (status === 'pending') return <span className="badge pending">⏳ Pending</span>;
    return <span className="badge not-uploaded">📄 Not Uploaded</span>;
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!candidate) return <div className="error-container">Candidate not found</div>;

  const hrStatus = getHrStatus();

  return (
    <div className="candidate-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>{candidate.name}</h1>
      </div>

      {/* ✅ Fixed: message is now a string */}
      {message && <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>}

      <div className="details-card">
        <div className="profile-section">
          <div className="profile-avatar">🧑</div>
          <div className="profile-info">
            <h2>{candidate.name}</h2>
            <p>📧 {candidate.email}</p>
            <p>💼 Position: {candidate.position || 'N/A'}</p>
          </div>
        </div>

        {/* ─── DOCUMENT VERIFICATION ────────────────────────────── */}
        <div className="section">
          <h3>📄 Document Verification</h3>
          <div className="docs-grid">
            
            {/* Aadhaar */}
            <div className="doc-card">
              <div className="doc-title">🆔 Aadhaar Card</div>
              <div className="doc-status">Status: {getBadge(aadhaarStatus)}</div>
              <div className="doc-controls">
                <select value={aadhaarStatus} onChange={(e) => setAadhaarStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => handleUpdateDocument('aadhaar', aadhaarStatus, setAadhaarStatus)} disabled={updating}>
                  Update
                </button>
                <button className="view-doc-btn" onClick={() => handleViewDocument('aadhaar')}>
                  👁️ View
                </button>
              </div>
            </div>

            {/* PAN */}
            <div className="doc-card">
              <div className="doc-title">💳 PAN Card</div>
              <div className="doc-status">Status: {getBadge(panStatus)}</div>
              <div className="doc-controls">
                <select value={panStatus} onChange={(e) => setPanStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => handleUpdateDocument('pan', panStatus, setPanStatus)} disabled={updating}>
                  Update
                </button>
                <button className="view-doc-btn" onClick={() => handleViewDocument('pan')}>
                  👁️ View
                </button>
              </div>
            </div>

            {/* Degree */}
            <div className="doc-card">
              <div className="doc-title">🎓 Degree Certificate</div>
              <div className="doc-status">Status: {getBadge(degreeStatus)}</div>
              <div className="doc-controls">
                <select value={degreeStatus} onChange={(e) => setDegreeStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => handleUpdateDocument('degree', degreeStatus, setDegreeStatus)} disabled={updating}>
                  Update
                </button>
                <button className="view-doc-btn" onClick={() => handleViewDocument('degree')}>
                  👁️ View
                </button>
              </div>
            </div>

            {/* Employment */}
            <div className="doc-card">
              <div className="doc-title">💼 Employment Proof</div>
              <div className="doc-status">Status: {getBadge(employmentStatus)}</div>
              <div className="doc-controls">
                <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => handleUpdateDocument('employment', employmentStatus, setEmploymentStatus)} disabled={updating}>
                  Update
                </button>
                <button className="view-doc-btn" onClick={() => handleViewDocument('employment')}>
                  👁️ View
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ─── HR STATUS ──────────────────────────────────────────── */}
        <div className="hr-status-section">
          <span>⭐ HR Final Status:</span>
          <span className={`badge ${hrStatus === 'Approved' ? 'approved' : hrStatus === 'Rejected' ? 'rejected' : 'pending'}`}>
            {hrStatus === 'Approved' ? '✅ Approved' : hrStatus === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
          </span>
        </div>

        {/* ─── REPORT GENERATION ──────────────────────────────────── */}
        <div className="action-buttons">
          <button 
            className="btn-generate" 
            onClick={handleGenerateReport}
            disabled={hrStatus !== 'Approved' || generating}
          >
            {generating ? '⏳ Generating...' : '📄 Generate BGV Report'}
          </button>
          <button 
            className="btn-download" 
            onClick={handleDownloadReport}
            disabled={!candidate?.reportId}
          >
            ⬇️ Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;