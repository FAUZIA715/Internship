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

  const triggerDashboardRefresh = () => {
    localStorage.setItem('refreshActivities', Date.now().toString());
  };

  const handleUpdateDegree = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-degree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: degreeStatus })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`✅ Degree status updated to ${degreeStatus}`);
        setCandidate(data.candidate);
        setDegreeStatus(data.candidate.degreeStatus);
        setEmploymentStatus(data.candidate.employmentStatus);
        triggerDashboardRefresh();
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
        const data = await response.json();
        setMessage(`✅ Employment status updated to ${employmentStatus}`);
        setCandidate(data.candidate);
        setDegreeStatus(data.candidate.degreeStatus);
        setEmploymentStatus(data.candidate.employmentStatus);
        triggerDashboardRefresh();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Update failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Generate Report button handler
  const handleGenerateReport = async () => {
    // Check if all verifications are complete
    const allAutoVerified = 
      candidate?.autoVerification?.aadhaar === 'Verified' &&
      candidate?.autoVerification?.pan === 'Verified' &&
      candidate?.autoVerification?.address === 'Verified';
    
    const allManualVerified = 
      candidate?.degreeStatus === 'Verified' &&
      candidate?.employmentStatus === 'Verified';
    
    if (!allAutoVerified || !allManualVerified) {
      setMessage('❌ Cannot generate report. All verifications must be completed first.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setMessage('⏳ Generating BGV Report...');
    
    // Simulate report generation (replace with actual API call later)
    setTimeout(() => {
      setMessage('✅ BGV Report generated successfully!');
      setCandidate({ ...candidate, reportGenerated: true });
    }, 2000);
    
    setTimeout(() => setMessage(''), 5000);
  };

  const handleDownloadReport = () => {
    if (!candidate?.reportGenerated) {
      setMessage('❌ No report available. Generate report first.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    alert('Download functionality will be implemented after integrating with Srinjoy\'s report module');
  };

  // Check if all conditions are met to enable Generate Report button
  const canGenerateReport = () => {
    if (!candidate) return false;
    
    const allAutoVerified = 
      candidate.autoVerification?.aadhaar === 'Verified' &&
      candidate.autoVerification?.pan === 'Verified' &&
      candidate.autoVerification?.address === 'Verified';
    
    const allManualVerified = 
      candidate.degreeStatus === 'Verified' &&
      candidate.employmentStatus === 'Verified';
    
    return allAutoVerified && allManualVerified;
  };

  const getBadge = (status) => {
    if (status === 'Verified') return <span className="badge verified">✅ Verified</span>;
    if (status === 'Approved') return <span className="badge approved">✅ Approved</span>;
    if (status === 'Rejected') return <span className="badge rejected">❌ Rejected</span>;
    return <span className="badge pending">⏳ Pending</span>;
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!candidate) return <div className="error-container">Candidate not found</div>;

  return (
    <div className="candidate-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/candidates-list')}>← Back to Candidates</button>
        <h1>{candidate.fullName}</h1>
      </div>

      {message && <div className="message success">{message}</div>}

      <div className="details-card">
        <div className="profile-section">
          <div className="profile-avatar">🧑</div>
          <div className="profile-info">
            <h2>{candidate.fullName}</h2>
            <p>📧 {candidate.email}</p>
            <p>📞 {candidate.phone}</p>
            <p>💼 {candidate.positionApplied}</p>
            <p>🏢 Department: {candidate.department}</p>
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
            <div>🆔 Aadhaar: {getBadge(candidate.autoVerification?.aadhaar)}</div>
            <div>💳 PAN: {getBadge(candidate.autoVerification?.pan)}</div>
            <div>🏠 Address: {getBadge(candidate.autoVerification?.address)}</div>
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
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateDegree}>Update</button>
              </div>
            </div>

            <div className="manual-card">
              <div className="manual-title">💼 Employment Proof</div>
              <div className="manual-status">Current: {getBadge(candidate.employmentStatus)}</div>
              <div className="manual-controls">
                <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} className="status-select">
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateEmployment}>Update</button>
              </div>
            </div>
          </div>
        </div>

        <div className="hr-status-section">
          <span>⭐ HR Final Status:</span>
          {getBadge(candidate.hrReviewStatus)}
        </div>

        <div className="action-buttons">
          <button 
            className="btn-generate" 
            onClick={handleGenerateReport}
            disabled={!canGenerateReport()}
          >
            📄 Generate BGV Report
          </button>
          <button 
            className="btn-download" 
            onClick={handleDownloadReport}
            disabled={!candidate?.reportGenerated}
          >
            ⬇️ Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;