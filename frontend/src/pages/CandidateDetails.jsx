import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CandidateDetails.css';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}`);
      const data = await response.json();
      setCandidate(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // View document - opens in new tab
  const handleViewDocument = (docType, docUrl) => {
    if (!docUrl) {
      alert(`❌ No ${docType} document uploaded by candidate`);
      return;
    }
    window.open(`http://localhost:5000${docUrl}`, '_blank');
  };

  // Update Match/Mismatch
  const updateMatch = async (field, value) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/compare`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (response.ok) {
        setMessage(`✅ ${field} marked as ${value}`);
        setTimeout(() => setMessage(''), 3000);
        fetchCandidate();
      } else {
        setMessage(`❌ Update failed`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage('❌ Server error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Generate Report (calls friend's API - placeholder)
  const generateReport = async () => {
    if (candidate?.hrReviewStatus !== 'Approved') {
      setMessage('❌ Cannot generate report. Candidate not approved yet.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    // This will call your friend's report generation API
    alert(`📄 BGV Report generation requested for ${candidate.fullName} (Friend's module will handle this)`);
    setMessage('✅ Report generation requested');
    setTimeout(() => setMessage(''), 3000);
  };

  // Download Report (calls friend's API - placeholder)
  const downloadReport = () => {
    if (!candidate?.reportGenerated) {
      alert('Please generate the report first.');
      return;
    }
    // This will call your friend's download API
    alert(`📥 Downloading BGV report for ${candidate.fullName} (Friend's module will handle this)`);
  };

  const getBadge = (status) => {
    if (status === 'Verified') return <span className="badge verified">✅ Verified</span>;
    if (status === 'Approved') return <span className="badge approved">✅ Approved</span>;
    if (status === 'Match') return <span className="badge match">✅ Match</span>;
    if (status === 'Mismatch') return <span className="badge mismatch">❌ Mismatch</span>;
    return <span className="badge pending">⏳ Pending</span>;
  };

  const getUploadStatus = (uploaded) => {
    return uploaded ? <span className="upload-status uploaded">✅ Uploaded</span> : <span className="upload-status missing">❌ Missing</span>;
  };

  const isAutoComplete = () => {
    if (!candidate?.autoVerification) return false;
    const v = candidate.autoVerification;
    return v.aadhaar === 'Verified' && v.pan === 'Verified' && v.degree === 'Verified' && 
           v.employment === 'Verified' && v.address === 'Verified';
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!candidate) return <div className="error-container">Candidate not found</div>;

  const autoComplete = isAutoComplete();

  return (
    <div className="candidate-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate('/candidates-list')}>← Back to Candidates</button>
        <h1>Candidate Details</h1>
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

        {/* Document View Buttons - HR can view actual documents */}
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

        {/* Auto Verification Results */}
        <div className="section">
          <h3>🤖 Auto Verification Results</h3>
          <div className="verif-grid">
            <div className="verif-item">Aadhaar: {getBadge(candidate.autoVerification?.aadhaar)}</div>
            <div className="verif-item">PAN: {getBadge(candidate.autoVerification?.pan)}</div>
            <div className="verif-item">Degree: {getBadge(candidate.autoVerification?.degree)}</div>
            <div className="verif-item">Employment: {getBadge(candidate.autoVerification?.employment)}</div>
            <div className="verif-item">Address: {getBadge(candidate.autoVerification?.address)}</div>
          </div>
          {!autoComplete && (
            <div className="verification-progress">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ 
                  width: `${Object.values(candidate.autoVerification || {}).filter(v => v === 'Verified').length * 20}%` 
                }}></div>
              </div>
              <div className="progress-text">Verification in progress...</div>
            </div>
          )}
        </div>

        {/* HR Review Section - Only after auto-verification complete */}
        {autoComplete ? (
          <div className="section hr-review">
            <h3>👔 HR Review (Compare & Confirm)</h3>
            <p className="review-note">📌 View documents above, then click Match or Mismatch</p>

            {/* Name Match */}
            <div className="compare-card">
              <div className="compare-header">Name Match</div>
              <div className="compare-row">
                <div className="compare-side">Candidate Entered: <strong>{candidate.fullName}</strong></div>
                <div className="compare-side">On Document: <strong>{candidate.fullName}</strong></div>
              </div>
              <div className="compare-buttons">
                <button className={`match-btn ${candidate.comparisonResults?.nameMatch === 'Match' ? 'active' : ''}`} onClick={() => updateMatch('nameMatch', 'Match')}>
                  ✅ Match
                </button>
                <button className={`mismatch-btn ${candidate.comparisonResults?.nameMatch === 'Mismatch' ? 'active' : ''}`} onClick={() => updateMatch('nameMatch', 'Mismatch')}>
                  ❌ Mismatch
                </button>
              </div>
              <div className="match-status">{getBadge(candidate.comparisonResults?.nameMatch)}</div>
            </div>

            {/* DOB Match */}
            <div className="compare-card">
              <div className="compare-header">Date of Birth Match</div>
              <div className="compare-row">
                <div className="compare-side">Candidate Entered: <strong>{new Date(candidate.dateOfBirth).toLocaleDateString()}</strong></div>
                <div className="compare-side">On Document: <strong>{new Date(candidate.dateOfBirth).toLocaleDateString()}</strong></div>
              </div>
              <div className="compare-buttons">
                <button className={`match-btn ${candidate.comparisonResults?.dobMatch === 'Match' ? 'active' : ''}`} onClick={() => updateMatch('dobMatch', 'Match')}>
                  ✅ Match
                </button>
                <button className={`mismatch-btn ${candidate.comparisonResults?.dobMatch === 'Mismatch' ? 'active' : ''}`} onClick={() => updateMatch('dobMatch', 'Mismatch')}>
                  ❌ Mismatch
                </button>
              </div>
              <div className="match-status">{getBadge(candidate.comparisonResults?.dobMatch)}</div>
            </div>

            {/* Address Match */}
            <div className="compare-card">
              <div className="compare-header">Address Match</div>
              <div className="compare-row">
                <div className="compare-side">Candidate Entered: <strong>{candidate.address}</strong></div>
                <div className="compare-side">On Document: <strong>{candidate.address}</strong></div>
              </div>
              <div className="compare-buttons">
                <button className={`match-btn ${candidate.comparisonResults?.addressMatch === 'Match' ? 'active' : ''}`} onClick={() => updateMatch('addressMatch', 'Match')}>
                  ✅ Match
                </button>
                <button className={`mismatch-btn ${candidate.comparisonResults?.addressMatch === 'Mismatch' ? 'active' : ''}`} onClick={() => updateMatch('addressMatch', 'Mismatch')}>
                  ❌ Mismatch
                </button>
              </div>
              <div className="match-status">{getBadge(candidate.comparisonResults?.addressMatch)}</div>
            </div>
          </div>
        ) : (
          <div className="section hr-review-disabled">
            <h3>👔 HR Review</h3>
            <p>⏳ Auto-verification in progress. HR review will be available after all documents are verified.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-generate" onClick={generateReport} disabled={candidate?.hrReviewStatus !== 'Approved'}>
            <i className="fas fa-file-pdf"></i> Generate BGV Report
          </button>
          <button className="btn-download" onClick={downloadReport} disabled={!candidate?.reportGenerated}>
            <i className="fas fa-download"></i> Download Report
          </button>
        </div>

        {/* Overall Status */}
        <div className="overall-status">
          <span>Overall HR Review Status:</span>
          {getBadge(candidate.hrReviewStatus)}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;