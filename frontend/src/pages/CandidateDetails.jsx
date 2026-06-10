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

  // Update Degree Status
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
        setTimeout(() => setMessage(''), 3000);
        fetchCandidate();
      } else {
        setMessage('❌ Update failed');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Update failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Update Employment Status
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
        setTimeout(() => setMessage(''), 3000);
        fetchCandidate();
      } else {
        setMessage('❌ Update failed');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Update failed');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Check if ALL 5 documents have been verified (not pending) - regardless of Verified or Rejected
  const isAllDocumentsProcessed = () => {
    if (!candidate) return false;
    return (
      candidate.autoVerification?.aadhaar !== 'Pending' &&
      candidate.autoVerification?.pan !== 'Pending' &&
      candidate.autoVerification?.address !== 'Pending' &&
      candidate.degreeStatus !== 'Pending' &&
      candidate.employmentStatus !== 'Pending'
    );
  };

  // Get overall status message
  const getOverallStatus = () => {
    if (!isAllDocumentsProcessed()) return 'Verification In Progress';
    
    const allVerified = (
      candidate.autoVerification?.aadhaar === 'Verified' &&
      candidate.autoVerification?.pan === 'Verified' &&
      candidate.autoVerification?.address === 'Verified' &&
      candidate.degreeStatus === 'Verified' &&
      candidate.employmentStatus === 'Verified'
    );
    
    return allVerified ? 'All Documents Verified ✅' : 'Some Documents Rejected ❌';
  };

  // Generate Report - Only when all documents processed
  const handleGenerateReport = async () => {
    if (!isAllDocumentsProcessed()) {
      setMessage('❌ Cannot generate report. Please wait for all document verifications to complete.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    const allVerified = (
      candidate.autoVerification?.aadhaar === 'Verified' &&
      candidate.autoVerification?.pan === 'Verified' &&
      candidate.autoVerification?.address === 'Verified' &&
      candidate.degreeStatus === 'Verified' &&
      candidate.employmentStatus === 'Verified'
    );
    
    const reportType = allVerified ? 'Verification Completed' : 'Verification Completed with Issues';
    
    alert(`📄 ${reportType} Report generated for ${candidate.fullName}`);
    setMessage(`✅ ${reportType} Report generated for ${candidate.fullName}`);
    
    // Mark report as generated so download button becomes enabled
    setCandidate({ ...candidate, reportGenerated: true });
    
    setTimeout(() => setMessage(''), 3000);
  };

  // Download Report - Available only after Generate is clicked
  const handleDownloadReport = () => {
    if (!candidate?.reportGenerated) {
      alert('Please generate the report first.');
      return;
    }
    const allVerified = (
      candidate.autoVerification?.aadhaar === 'Verified' &&
      candidate.autoVerification?.pan === 'Verified' &&
      candidate.autoVerification?.address === 'Verified' &&
      candidate.degreeStatus === 'Verified' &&
      candidate.employmentStatus === 'Verified'
    );
    const reportType = allVerified ? 'Verification Completed' : 'Verification Completed with Issues';
    alert(`📥 Downloading ${reportType} report for ${candidate.fullName}`);
  };

  const getBadge = (status) => {
    if (status === 'Verified') return <span className="badge verified">✅ Verified</span>;
    if (status === 'Rejected') return <span className="badge rejected">❌ Rejected</span>;
    return <span className="badge pending">⏳ Pending</span>;
  };

  const getUploadStatus = (uploaded) => {
    return uploaded ? <span className="upload-status uploaded">✅ Uploaded</span> : <span className="upload-status missing">❌ Missing</span>;
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!candidate) return <div className="error-container">Candidate not found</div>;

  const allProcessed = isAllDocumentsProcessed();

  return (
    <div className="candidate-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/candidates-list')}>← Back to Candidates</button>
        <h1>{candidate.fullName}</h1>
      </div>

      {message && <div className="message success">{message}</div>}

      <div className="details-card">
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="profile-info">
            <h2>{candidate.fullName}</h2>
            <p><i className="fas fa-envelope"></i> {candidate.email}</p>
            <p><i className="fas fa-phone"></i> {candidate.phone}</p>
            <p><i className="fas fa-briefcase"></i> {candidate.positionApplied}</p>
            <p><i className="fas fa-calendar"></i> DOB: {new Date(candidate.dateOfBirth).toLocaleDateString()}</p>
            <p><i className="fas fa-home"></i> Address: {candidate.address}</p>
          </div>
        </div>

        {/* Document Upload Status */}
        <div className="section">
          <h3>📄 Document Upload Status</h3>
          <div className="docs-grid">
            <div className="doc-item">Aadhaar: {getUploadStatus(candidate.documents?.aadhaar)}</div>
            <div className="doc-item">PAN: {getUploadStatus(candidate.documents?.pan)}</div>
            <div className="doc-item">Degree: {getUploadStatus(candidate.documents?.degree)}</div>
            <div className="doc-item">Employment: {getUploadStatus(candidate.documents?.employment)}</div>
            <div className="doc-item">Address: {getUploadStatus(candidate.documents?.address)}</div>
          </div>
        </div>

        {/* Document View Buttons */}
        <div className="section">
          <h3>📎 View Uploaded Documents</h3>
          <div className="doc-buttons-grid">
            <button className="doc-view-btn" onClick={() => handleViewDocument('Aadhaar', candidate.documents?.aadhaar)}>
              <i className="fas fa-id-card"></i> View Aadhaar
            </button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('PAN', candidate.documents?.pan)}>
              <i className="fas fa-credit-card"></i> View PAN
            </button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('Degree', candidate.documents?.degree)}>
              <i className="fas fa-graduation-cap"></i> View Degree
            </button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('Employment', candidate.documents?.employment)}>
              <i className="fas fa-briefcase"></i> View Employment
            </button>
            <button className="doc-view-btn" onClick={() => handleViewDocument('Address', candidate.documents?.address)}>
              <i className="fas fa-home"></i> View Address
            </button>
          </div>
        </div>

        {/* Auto Verification Results - Aadhaar, PAN, Address (Read Only) */}
        <div className="section">
          <h3>🤖 Auto Verification Results</h3>
          <div className="auto-verif-grid">
            <div className="auto-verif-item">Aadhaar: {getBadge(candidate.autoVerification?.aadhaar)}</div>
            <div className="auto-verif-item">PAN: {getBadge(candidate.autoVerification?.pan)}</div>
            <div className="auto-verif-item">Address: {getBadge(candidate.autoVerification?.address)}</div>
          </div>
        </div>

        {/* HR Manual Verification - Degree & Employment */}
        <div className="section">
          <h3>👔 HR Manual Verification</h3>
          <div className="hr-manual-grid">
            {/* Degree Certificate */}
            <div className="manual-card">
              <div className="manual-title">🎓 Degree Certificate</div>
              <div className="manual-status">Current: {getBadge(candidate.degreeStatus)}</div>
              <div className="manual-controls">
                <select 
                  value={degreeStatus} 
                  onChange={(e) => setDegreeStatus(e.target.value)} 
                  className="status-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateDegree}>Update</button>
              </div>
            </div>

            {/* Employment Proof */}
            <div className="manual-card">
              <div className="manual-title">💼 Employment Proof</div>
              <div className="manual-status">Current: {getBadge(candidate.employmentStatus)}</div>
              <div className="manual-controls">
                <select 
                  value={employmentStatus} 
                  onChange={(e) => setEmploymentStatus(e.target.value)} 
                  className="status-select"
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <button className="btn-update" onClick={handleUpdateEmployment}>Update</button>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="overall-status">
          <span>Overall Status:</span>
          <span className={`status-text ${allProcessed ? (getOverallStatus().includes('Verified') ? 'success' : 'warning') : 'pending'}`}>
            {getOverallStatus()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn-generate" 
            onClick={handleGenerateReport} 
            disabled={!allProcessed}
          >
            <i className="fas fa-file-pdf"></i> Generate BGV Report
          </button>
          <button 
            className="btn-download" 
            onClick={handleDownloadReport} 
            disabled={!candidate?.reportGenerated}
          >
            <i className="fas fa-download"></i> Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;