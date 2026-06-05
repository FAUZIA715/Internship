import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CandidateProfile.css';

const CandidateProfile = () => {
  const { email } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!email) return;
      setLoading(true);
      
      try {
        // Fetch candidate profile
        const profileRes = await fetch(`http://localhost:5000/api/candidates/${email}`);
        if (!profileRes.ok) {
          setError('Candidate not found');
          setLoading(false);
          return;
        }
        const candidateData = await profileRes.json();
        console.log('Candidate data:', candidateData);
        setCandidate(candidateData);

        // Fetch verification status
        const statusRes = await fetch(`http://localhost:5000/api/candidates/verification-status/${email}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatus(statusData);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email]);

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
      {/* Back Button at Top */}
      <div className="top-bar">
        <button className="back-top-btn" onClick={() => navigate('/candidates')}>
          ← Back to All Candidates
        </button>
      </div>

      <div className="profile-card">
        <h2>Candidate Profile</h2>
        
        {candidate && (
          <>
            {/* Personal Information Section */}
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
              
              {/* Resume Section - Only Download Button */}
              <div className="info-row">
                <span className="label">Resume:</span>
                <span>
                  {candidate.resumeUrl ? (
                    <div className="resume-actions">
                      <a 
                        href={`http://localhost:5000${candidate.resumeUrl}`} 
                        download
                        className="download-resume-link"
                      >
                        ⬇️ Download Resume
                      </a>
                    </div>
                  ) : (
                    <span className="no-resume">No resume uploaded</span>
                  )}
                </span>
              </div>
            </div>

            {/* Verification Status Section */}
            {status && (
              <div className="verification-section">
                <h3>✅ Verification Status</h3>
                <table className="status-table">
                  <thead>
                    <tr>
                      <th>Verification Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Aadhaar Verification</td>
                      <td>
                        <span className="status-badge" style={getStatusBadge(status.aadhaar)}>
                          {status.aadhaar}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>PAN Verification</td>
                      <td>
                        <span className="status-badge" style={getStatusBadge(status.pan)}>
                          {status.pan}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Education Verification</td>
                      <td>
                        <span className="status-badge" style={getStatusBadge(status.education)}>
                          {status.education}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td>Employment Verification</td>
                      <td>
                        <span className="status-badge" style={getStatusBadge(status.employment)}>
                          {status.employment}
                        </span>
                      </td>
                    </tr>
                    <tr className="overall-row">
                      <td><strong>Overall Verification Result</strong></td>
                      <td>
                        <span className="status-badge" style={getStatusBadge(status.overall)}>
                          {status.overall}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Edit Profile Button */}
            <div className="button-group">
              <button 
                onClick={() => navigate(`/edit-profile/${candidate.email}`)} 
                className="edit-btn"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;