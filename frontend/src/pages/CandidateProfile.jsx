import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CandidateProfile.css';

const CandidateProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  // Get where we came from (dashboard or candidates)
  const from = location.state?.from || 'candidates';

  useEffect(() => {
    fetchData();
  }, [email]);

  const fetchData = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const profileRes = await fetch(`http://localhost:5000/api/candidates/${email}`);
      if (!profileRes.ok) {
        setError('Candidate not found');
        setLoading(false);
        return;
      }
      const candidateData = await profileRes.json();
      setCandidate(candidateData);

      const statusRes = await fetch(`http://localhost:5000/api/candidates/verification-status/${email}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (type, value) => {
    setUpdating(true);
    setUpdateMessage('');
    
    try {
      const updateData = {};
      updateData[type] = value;
      
      const response = await fetch(`http://localhost:5000/api/candidates/verification/${email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        setUpdateMessage(`✅ ${type} status updated to ${value}`);
        const statusRes = await fetch(`http://localhost:5000/api/candidates/verification-status/${email}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatus(statusData);
        }
        setTimeout(() => setUpdateMessage(''), 3000);
      } else {
        setUpdateMessage('❌ Update failed');
      }
    } catch (error) {
      setUpdateMessage('❌ Server error');
    } finally {
      setUpdating(false);
    }
  };

  // Send Manual Email to Candidate
  const sendManualEmail = async (candidateEmail, candidateName) => {
    const defaultMessage = `Dear ${candidateName},\n\nYour background verification has been successfully completed!\n\nWe will contact you shortly for the interview.\n\nBest Regards,\nHR Team`;
    
    const message = prompt(`Send email to ${candidateName} (${candidateEmail}):\n\nEnter message:`, defaultMessage);
    
    if (message) {
      try {
        const response = await fetch('http://localhost:5000/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: candidateEmail, fullName: candidateName, message })
        });
        
        if (response.ok) {
          alert(`✅ Email sent to ${candidateName} successfully!`);
        } else {
          alert('❌ Failed to send email');
        }
      } catch (error) {
        alert('❌ Error sending email');
      }
    }
  };

  const handleGoBack = () => {
    if (from === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate('/candidates');
    }
  };

  const getStatusBadge = (statusValue) => {
    const colors = {
      'Verified': '#10b981',
      'Pending': '#f59e0b',
      'Rejected': '#ef4444',
      'Partially Verified': '#8b5cf6'
    };
    return { backgroundColor: colors[statusValue] || '#6b7280', color: 'white' };
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-container">
      {/* Smart Back Button */}
      <div className="top-bar">
        <button className="back-top-btn" onClick={handleGoBack}>
          ← Back to {from === 'dashboard' ? 'Dashboard' : 'All Candidates'}
        </button>
      </div>

      <div className="profile-card">
        <div className="admin-badge">
          <span className="admin-icon">👑</span>
          <span>Admin Portal | Update Verification Status</span>
        </div>

        <h2>Candidate Profile</h2>
        
        {updateMessage && (
          <div className={`message ${updateMessage.includes('✅') ? 'success' : 'error'}`}>
            {updateMessage}
          </div>
        )}
        
        {candidate && (
          <>
            <div className="profile-section">
              <h3>📋 Personal Information</h3>
              <div className="info-row">
                <span className="label">Full Name:</span>
                <span>{candidate.fullName}</span>
              </div>
              <div className="info-row">
                <span className="label">Date of Birth:</span>
                <span>{new Date(candidate.dateOfBirth).toLocaleDateString()}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span>{candidate.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span>{candidate.phone}</span>
              </div>
              <div className="info-row">
                <span className="label">Address:</span>
                <span>{candidate.address}</span>
              </div>
              <div className="info-row">
                <span className="label">Position:</span>
                <span>{candidate.positionApplied}</span>
              </div>
              <div className="info-row">
                <span className="label">Experience:</span>
                <span>{candidate.experience}</span>
              </div>
              
              <div className="info-row">
                <span className="label">Resume:</span>
                <span>
                  {candidate.resumeUrl ? (
                    <a 
                      href={`http://localhost:5000${candidate.resumeUrl}`} 
                      download
                      className="download-resume-link"
                    >
                      ⬇️ Download Resume
                    </a>
                  ) : (
                    <span className="no-resume">No resume uploaded</span>
                  )}
                </span>
              </div>
            </div>

            {status && (
              <div className="verification-section">
                <h3>✅ Verification Status</h3>
                <table className="status-table">
                  <thead>
                    <tr>
                      <th>Verification Type</th>
                      <th>Current Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Aadhaar Row */}
                    <tr>
                      <td>Aadhaar Verification</td>
                      <td><span className="status-badge" style={getStatusBadge(status.aadhaar)}>{status.aadhaar}</span></td>
                      <td>
                        <div className="update-controls">
                          <select defaultValue={status.aadhaar} className="status-select" id="aadhaar-select">
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button className="update-btn" onClick={() => updateVerificationStatus('aadhaar', document.getElementById('aadhaar-select').value)} disabled={updating}>
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* PAN Row */}
                    <tr>
                      <td>PAN Verification</td>
                      <td><span className="status-badge" style={getStatusBadge(status.pan)}>{status.pan}</span></td>
                      <td>
                        <div className="update-controls">
                          <select defaultValue={status.pan} className="status-select" id="pan-select">
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button className="update-btn" onClick={() => updateVerificationStatus('pan', document.getElementById('pan-select').value)} disabled={updating}>
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Education Row */}
                    <tr>
                      <td>Education Verification</td>
                      <td><span className="status-badge" style={getStatusBadge(status.education)}>{status.education}</span></td>
                      <td>
                        <div className="update-controls">
                          <select defaultValue={status.education} className="status-select" id="education-select">
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Partially Verified">Partially Verified</option>
                          </select>
                          <button className="update-btn" onClick={() => updateVerificationStatus('education', document.getElementById('education-select').value)} disabled={updating}>
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Employment Row */}
                    <tr>
                      <td>Employment Verification</td>
                      <td><span className="status-badge" style={getStatusBadge(status.employment)}>{status.employment}</span></td>
                      <td>
                        <div className="update-controls">
                          <select defaultValue={status.employment} className="status-select" id="employment-select">
                            <option value="Pending">Pending</option>
                            <option value="Verified">Verified</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Partially Verified">Partially Verified</option>
                          </select>
                          <button className="update-btn" onClick={() => updateVerificationStatus('employment', document.getElementById('employment-select').value)} disabled={updating}>
                            Update
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Overall Row */}
                    <tr className="overall-row">
                      <td><strong>Overall Verification Result</strong></td>
                      <td><span className="status-badge" style={getStatusBadge(status.overall)}>{status.overall}</span></td>
                      <td>(Auto-calculated)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Buttons - Edit Profile & Send Email */}
            <div className="button-group">
              <button 
                onClick={() => navigate(`/edit-profile/${candidate.email}`)} 
                className="edit-btn"
              >
                ✏️ Edit Profile
              </button>
<button 
  onClick={() => navigate(`/send-email/${candidate.email}`)} 
  className="email-btn"
>
  📧 Send Email
</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;