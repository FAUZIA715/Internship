import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CandidateDetails.css';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [degreeStatus, setDegreeStatus] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [updatingDegree, setUpdatingDegree] = useState(false);
  const [updatingEmployment, setUpdatingEmployment] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

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
      setDegreeStatus(data.degreeStatus || 'not_uploaded');
      setEmploymentStatus(data.employmentStatus || 'not_uploaded');
    } catch (err) {
      console.error('Error fetching candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerDashboardRefresh = () => {
    localStorage.setItem('refreshActivities', Date.now().toString());
  };

  const handleUpdateDegree = async () => {
    if (updatingDegree) return;
    setUpdatingDegree(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-degree`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: degreeStatus })
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Degree status updated to ${degreeStatus}`);
        fetchCandidate();
        triggerDashboardRefresh();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to update degree');
    } finally {
      setUpdatingDegree(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateEmployment = async () => {
    if (updatingEmployment) return;
    setUpdatingEmployment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-employment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: employmentStatus })
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Employment status updated to ${employmentStatus}`);
        fetchCandidate();
        triggerDashboardRefresh();
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to update employment');
    } finally {
      setUpdatingEmployment(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ─── GENERATE BGV REPORT ──────────────────────────────────────────
  const handleGenerateReport = async () => {
    const allVerified = 
      candidate?.aadhaarStatus === 'verified' &&
      candidate?.panStatus === 'verified' &&
      candidate?.addressStatus === 'verified' &&
      candidate?.degreeStatus === 'verified' &&
      candidate?.employmentStatus === 'verified';

    if (!allVerified) {
      setMessage('❌ All documents must be verified first.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setGenerating(true);
    setMessage('⏳ Generating BGV Report...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/generate/${candidate._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(`✅ Report generated! Decision: ${data.report.finalDecision}`);
        setCandidate({
          ...candidate,
          reportGenerated: true,
          reportId: data.report.id
        });
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Could not generate report.');
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // ─── DOWNLOAD REPORT ──────────────────────────────────────────────
  const handleDownloadReport = async () => {
    if (!candidate?.reportId) {
      setMessage('❌ No report available.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/download/${candidate.reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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

  const getBadge = (status) => {
    if (status === 'verified') return <span className="badge verified">✅ Verified</span>;
    if (status === 'rejected') return <span className="badge rejected">❌ Rejected</span>;
    if (status === 'pending') return <span className="badge pending">⏳ Pending</span>;
    return <span className="badge not-uploaded">📄 Not Uploaded</span>;
  };

  const getHrStatus = () => {
    if (!candidate) return 'Pending';
    const docs = [
      candidate.aadhaarStatus,
      candidate.panStatus,
      candidate.addressStatus,
      candidate.degreeStatus,
      candidate.employmentStatus
    ];
    if (docs.every(s => s === 'verified')) return 'Approved';
    if (docs.some(s => s === 'rejected')) return 'Rejected';
    return 'Pending';
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

        <div className="section">
          <h3>📄 Document Upload Status</h3>
          <div className="docs-grid">
            <div className="doc-item">🆔 Aadhaar: {candidate.documents?.aadhaar ? '✅ Uploaded' : '❌ Missing'}</div>
            <div className="doc-item">💳 PAN: {candidate.documents?.pan ? '✅ Uploaded' : '❌ Missing'}</div>
            <div className="doc-item">🎓 Degree: {candidate.documents?.degree ? '✅ Uploaded' : '❌ Missing'}</div>
            <div className="doc-item">💼 Employment: {candidate.documents?.employment ? '✅ Uploaded' : '❌ Missing'}</div>
            <div className="doc-item">🏠 Address: {candidate.documents?.address ? '✅ Uploaded' : '❌ Missing'}</div>
          </div>
        </div>

        <div className="section">
          <h3>🤖 Auto Verification Results</h3>
          <div className="auto-verif-grid">
            <div>🆔 Aadhaar: {getBadge(candidate.aadhaarStatus)}</div>
            <div>💳 PAN: {getBadge(candidate.panStatus)}</div>
            <div>🏠 Address: {getBadge(candidate.addressStatus)}</div>
          </div>
        </div>

        <div className="section">
          <h3>👔 HR Manual Verification</h3>
          <div className="hr-manual-grid">
            <div className="manual-card">
              <div className="manual-title">🎓 Degree Certificate</div>
              <div className="manual-status">Current: {getBadge(candidate.degreeStatus)}</div>
              <div className="manual-controls">
                <select value={degreeStatus} onChange={(e) => setDegreeStatus(e.target.value)} className="status-select">
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateDegree} disabled={updatingDegree}>
                  {updatingDegree ? '⏳ Updating...' : 'Update'}
                </button>
              </div>
            </div>

            <div className="manual-card">
              <div className="manual-title">💼 Employment Proof</div>
              <div className="manual-status">Current: {getBadge(candidate.employmentStatus)}</div>
              <div className="manual-controls">
                <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} className="status-select">
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateEmployment} disabled={updatingEmployment}>
                  {updatingEmployment ? '⏳ Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hr-status-section">
          <span>⭐ HR Final Status:</span>
          <span className={`badge ${hrStatus === 'Approved' ? 'approved' : hrStatus === 'Rejected' ? 'rejected' : 'pending'}`}>
            {hrStatus === 'Approved' ? '✅ Approved' : hrStatus === 'Rejected' ? '❌ Rejected' : '⏳ Pending'}
          </span>
        </div>

        {/* ─── REPORT GENERATION BUTTONS ──────────────────────────── */}
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