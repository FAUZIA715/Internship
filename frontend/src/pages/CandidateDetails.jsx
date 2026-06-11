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

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}`);
      const data = await response.json();
      setCandidate(data);
      setDegreeStatus(data.degreeStatus || 'Pending');
      setEmploymentStatus(data.employmentStatus || 'Pending');
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (docType, docUrl) => {
    if (!docUrl) {
      alert(`❌ No ${docType} document uploaded`);
      return;
    }
    window.open(`http://localhost:5000${docUrl}`, '_blank');
  };

  const handleUpdateDegree = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-degree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: degreeStatus })
      });
      
      if (response.ok) {
        setMessage(`✅ Degree status updated to ${degreeStatus}`);
        fetchCandidate();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Update failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateEmployment = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-employment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: employmentStatus })
      });
      
      if (response.ok) {
        setMessage(`✅ Employment status updated to ${employmentStatus}`);
        fetchCandidate();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Update failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleGenerateReport = async () => {
    if (candidate?.hrReviewStatus !== 'Approved') {
      setMessage('❌ Cannot generate report. Candidate not approved yet.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    alert(`📄 BGV Report generation requested for ${candidate.fullName}`);
  };

  const handleDownloadReport = () => {
    if (!candidate?.reportGenerated) {
      alert('Please generate the report first.');
      return;
    }
    alert(`📥 Downloading BGV report for ${candidate.fullName}`);
  };

  const getBadge = (status) => {
    if (status === 'Verified') return <span className="badge verified">✅ Verified</span>;
    if (status === 'Approved') return <span className="badge approved">✅ Approved</span>;
    if (status === 'Rejected') return <span className="badge rejected">❌ Rejected</span>;
    return <span className="badge pending">⏳ Pending</span>;
  };

  const getUploadStatus = (uploaded) => {
    return uploaded ? <span className="upload-status uploaded">✅ Uploaded</span> : <span className="upload-status missing">❌ Missing</span>;
  };

  if (loading) return <div className="loading-container">⏳ Loading...</div>;
  if (!candidate) return <div className="error-container">⚠️ Candidate not found</div>;



  
  return (
    <div className="candidate-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/candidates-list')}>← Back to Candidates</button>
        <h1>👤 {candidate.fullName}</h1>
      </div>

      {message && <div className="message success">✅ {message}</div>}

      <div className="details-card">
        <div className="profile-section">
          <div className="profile-avatar">
            🧑
          </div>
          <div className="profile-info">
            <h2>👤 {candidate.fullName}</h2>
            <p>📧 {candidate.email}</p>
            <p>📞 {candidate.phone}</p>
            <p>💼 {candidate.positionApplied}</p>
            <p>📅 DOB: {new Date(candidate.dateOfBirth).toLocaleDateString()}</p>
            <p>🏠 Address: {candidate.address}</p>
          </div>
        </div>

        <div className="section">
          <h3>📄 Document Upload Status</h3>
          <div className="docs-grid">
            <div className="doc-item">🆔 Aadhaar: {getUploadStatus(candidate.documents?.aadhaar)}</div>
            <div className="doc-item">💳 PAN: {getUploadStatus(candidate.documents?.pan)}</div>
            <div className="doc-item">🎓 Degree: {getUploadStatus(candidate.documents?.degree)}</div>
            <div className="doc-item">💼 Employment: {getUploadStatus(candidate.documents?.employment)}</div>
            <div className="doc-item">🏠 Address: {getUploadStatus(candidate.documents?.address)}</div>
          </div>
        </div>

        <div className="section">
          <h3>👁️ View Uploaded Documents</h3>
          <div className="doc-buttons-grid">
            <button className="doc-view-btn" onClick={() => handleViewDocument('Aadhaar', candidate.documents?.aadhaar)}>🆔 View Aadhaar</button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('PAN', candidate.documents?.pan)}>💳 View PAN</button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('Degree', candidate.documents?.degree)}>🎓 View Degree</button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('Employment', candidate.documents?.employment)}>💼 View Employment</button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('Address', candidate.documents?.address)}>🏠 View Address</button>
          </div>
        </div>

        <div className="section">
          <h3>🤖 Auto Verification Results</h3>
          <div className="auto-verif-grid">
            <div className="auto-verif-item">🆔 Aadhaar: {getBadge(candidate.autoVerification?.aadhaar)}</div>
            <div className="auto-verif-item">💳 PAN: {getBadge(candidate.autoVerification?.pan)}</div>
            <div className="auto-verif-item">🏠 Address: {getBadge(candidate.autoVerification?.address)}</div>
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
                  <option value="Pending">⏳ Pending</option>
                  <option value="Verified">✅ Verified</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateDegree}>💾 Update</button>
              </div>
            </div>

            <div className="manual-card">
              <div className="manual-title">💼 Employment Proof</div>
              <div className="manual-status">Current: {getBadge(candidate.employmentStatus)}</div>
              <div className="manual-controls">
                <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} className="status-select">
                  <option value="Pending">⏳ Pending</option>
                  <option value="Verified">✅ Verified</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateEmployment}>💾 Update</button>
              </div>
            </div>
          </div>
        </div>

        <div className="hr-status-section">
          <div className="hr-status-label">🏁 HR Final Status:</div>
          <div className="hr-status-value">{getBadge(candidate.hrReviewStatus)}</div>
        </div>

        <div className="action-buttons">
          <button className="btn-generate" onClick={handleGenerateReport} disabled={candidate?.hrReviewStatus !== 'Approved'}>
            📄 Generate BGV Report
          </button>
          <button className="btn-download" onClick={handleDownloadReport} disabled={!candidate?.reportGenerated}>
            ⬇️ Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;