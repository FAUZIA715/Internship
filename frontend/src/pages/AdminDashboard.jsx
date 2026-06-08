import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    completion: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const verified = data.filter(c => c.overallStatus === 'Verified').length;
    const pending = data.filter(c => c.overallStatus === 'Pending').length;
    const rejected = data.filter(c => c.overallStatus === 'Rejected').length;
    const completion = total > 0 ? Math.round((verified / total) * 100) : 0;
    setStats({ total, verified, pending, rejected, completion });
  };

  if (loading) {
    return <div className="dashboard-loading">Loading Admin Workspace...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Header with Workspace Logo */}
      <div className="dashboard-header">
        <div className="workspace-logo">
          <span className="logo-icon">👑</span>
          <h1>Admin Workspace</h1>
        </div>
        <div className="admin-info">
          <span className="admin-name">Administrator</span>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, Admin!</h1>
        <p>Manage candidates, track verification status, and send notifications</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.verified}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.completion}%</div>
          <div className="stat-label">Completion</div>
        </div>
      </div>

      {/* Quick Actions Menu */}
      <div className="actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card" onClick={() => navigate('/register')}>
            <div className="action-icon">📝</div>
            <h3>Register Candidate</h3>
            <p>Add new candidate with details and resume</p>
          </div>
          <div className="action-card" onClick={() => navigate('/candidates')}>
            <div className="action-icon">📋</div>
            <h3>View All Candidates</h3>
            <p>View all registered candidates with status</p>
          </div>
          <div className="action-card" onClick={() => navigate('/candidates')}>
            <div className="action-icon">🔍</div>
            <h3>Verification Status</h3>
            <p>Track and update verification progress</p>
          </div>
          <div className="action-card" onClick={() => alert('Report generation coming soon')}>
            <div className="action-icon">📊</div>
            <h3>Download Reports</h3>
            <p>Download verification reports and summaries</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {candidates.slice(0, 5).map((candidate, idx) => (
            <div key={idx} className="activity-item">
              <div className="activity-icon">
                {candidate.overallStatus === 'Verified' ? '✅' : '📄'}
              </div>
              <div className="activity-info">
                <div className="activity-name">{candidate.fullName}</div>
                <div className="activity-position">{candidate.positionApplied}</div>
                <div className="activity-meta">
                  <span className={`status-tag ${candidate.overallStatus === 'Verified' ? 'verified' : 'pending'}`}>
                    {candidate.overallStatus}
                  </span>
                  <span className="activity-date">
                    Registered on {new Date(candidate.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                className="activity-view-btn"
                onClick={() => navigate(`/profile/${candidate.email}`, { state: { from: 'dashboard' } })}
              >
                View →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;