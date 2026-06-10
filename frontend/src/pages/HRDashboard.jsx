import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HRDashboard.css';

const HRDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, pending: 0, approved: 0, rejected: 0,
    departments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hr/candidates');
      const data = await response.json();
      setCandidates(data);
      
      const total = data.length;
      const pending = data.filter(c => c.hrReviewStatus === 'Pending').length;
      const approved = data.filter(c => c.hrReviewStatus === 'Approved').length;
      const rejected = data.filter(c => c.hrReviewStatus === 'Rejected').length;
      
      // Department stats
      const departments = [
        { name: 'Engineering', count: data.filter(c => c.department === 'Engineering').length },
        { name: 'Product', count: data.filter(c => c.department === 'Product').length },
        { name: 'Design', count: data.filter(c => c.department === 'Design').length },
        { name: 'Sales', count: data.filter(c => c.department === 'Sales').length },
        { name: 'HR', count: data.filter(c => c.department === 'HR').length }
      ];
      
      setStats({ total, pending, approved, rejected, departments });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading Dashboard...</div>;

  return (
    <div className="hr-dashboard">
      <div className="dashboard-header">
        <div className="logo-area">
          <div className="logo-icon-small"><i className="fas fa-shield-alt"></i></div>
          <span className="logo-text">HR Workspace</span>
        </div>
        <div className="user-area">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <div><p className="user-name">HR Administrator</p><p className="user-role">Verification Manager</p></div>
          </div>
          <button onClick={onLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>

      <div className="welcome-section">
        <h1>Welcome back, HR Administrator!</h1>
        <p>Manage candidate verifications and track document status</p>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => navigate('/candidates-list?filter=all')}>
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card pending" onClick={() => navigate('/candidates-list?filter=pending')}>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pending Review</div>
        </div>
        <div className="stat-card approved" onClick={() => navigate('/candidates-list?filter=approved')}>
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card rejected" onClick={() => navigate('/candidates-list?filter=rejected')}>
          <div className="stat-icon"><i className="fas fa-times-circle"></i></div>
          <div className="stat-number">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="departments-section">
        <h3><i className="fas fa-building"></i> Departments</h3>
        <div className="departments-grid">
          {stats.departments.map((dept, idx) => (
            <div key={idx} className="dept-card" onClick={() => navigate(`/candidates-list?department=${dept.name}`)}>
              <div className="dept-name">{dept.name}</div>
              <div className="dept-count">{dept.count} candidates</div>
            </div>
          ))}
          <div className="dept-card view-all" onClick={() => navigate('/candidates-list?filter=all')}>
            <div className="dept-name">View All</div>
            <div className="dept-count">{stats.total} candidates</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-group">
        <button className="action-btn primary" onClick={() => navigate('/candidates-list?filter=pending')}>
          <i className="fas fa-clock"></i> View Pending ({stats.pending})
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/candidates-list?filter=approved')}>
          <i className="fas fa-check-circle"></i> View Approved ({stats.approved})
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/candidates-list?filter=all')}>
          <i className="fas fa-users"></i> View All Candidates
        </button>
      </div>
    </div>
  );
};

export default HRDashboard;