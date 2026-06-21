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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hr/candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCandidates(data);
      
      const total = data.length;
      const pending = data.filter(c => candidateIsPending(c)).length;
      const approved = data.filter(c => candidateIsApproved(c)).length;
      const rejected = data.filter(c => candidateIsRejected(c)).length;
      
      const departments = [
        { name: 'Engineering', count: data.filter(c => c.department === 'Engineering').length },
        { name: 'Product', count: data.filter(c => c.department === 'Product').length },
        { name: 'Design', count: data.filter(c => c.department === 'Design').length },
        { name: 'Sales', count: data.filter(c => c.department === 'Sales').length },
        { name: 'Marketing', count: data.filter(c => c.department === 'Marketing').length },
      ];
      
      setStats({ total, pending, approved, rejected, departments });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">⏳ Loading Dashboard...</div>;

  return (
    <div className="hr-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="logo-area">
          <div className="logo-icon-small">
            🛡️
          </div>
          <div className="logo-wrapper">
            <span className="logo-brand">VeriFlow</span>
            <span className="logo-divider">|</span>
            <span className="logo-brand">HR Workspace</span>
          </div>
        </div>
        <div className="user-area">
          <div className="user-info">
            <div className="user-avatar">🧑</div>
            <div>
              <p className="user-name">HR Administrator</p>
              <p className="user-role">Verification Manager</p>
            </div>
          </div>
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>👋 Welcome back, HR Administrator!</h1>
        <p>📊 Manage candidate verifications and track document status</p>
      </div>

      {/* Stats Cards with Simple Icons */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => navigate('/candidates-list?filter=all')}>
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Candidates</div>
          </div>
        </div>
        <div className="stat-card pending" onClick={() => navigate('/candidates-list?filter=pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
        <div className="stat-card approved" onClick={() => navigate('/candidates-list?filter=approved')}>
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card rejected" onClick={() => navigate('/candidates-list?filter=rejected')}>
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      {/* Departments Section */}
      <div className="departments-section">
        <h3>🏢 Departments</h3>
        <div className="departments-grid">
          {stats.departments.map((dept, idx) => (
            <div key={idx} className="dept-card" onClick={() => navigate(`/candidates-list?department=${dept.name}`)}>
              <div className="dept-name">📁 {dept.name}</div>
              <div className="dept-count">👤 {dept.count} candidates</div>
            </div>
          ))}
          <div className="dept-card view-all" onClick={() => navigate('/candidates-list?filter=all')}>
            <div className="dept-name">👁️ View All</div>
            <div className="dept-count">👥 {stats.total} candidates</div>
          </div>
        </div>
      </div>



      {/* Action Buttons */}
      <div className="action-buttons-group">
        <button className="action-btn primary" onClick={() => navigate('/candidates-list?filter=pending')}>
          ⏳ View Pending ({stats.pending})
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/candidates-list?filter=approved')}>
          ✅ View Approved ({stats.approved})
        </button>
        <button className="action-btn secondary" onClick={() => navigate('/candidates-list?filter=all')}>
          👥 View All Candidates
        </button>
      </div>
    </div>
  );
};

// ✅ FIXED: Candidate is Approved when ALL documents are verified
  const candidateIsApproved = (candidate) => {
    const docs = [
      candidate.documents?.aadhaar?.status,
      candidate.documents?.pan?.status,
      candidate.documents?.degree?.status,
      candidate.documents?.employment?.status
    ];
    // If any document is undefined or not 'verified', candidate is NOT approved
    if (docs.some(s => s === undefined || s === 'pending' || s === 'rejected')) {
      return false;
    }
    return docs.every(s => s === 'verified');
  };

  // ✅ FIXED: Candidate is Rejected when ANY document is rejected
  const candidateIsRejected = (candidate) => {
    const docs = [
      candidate.documents?.aadhaar?.status,
      candidate.documents?.pan?.status,
      candidate.documents?.degree?.status,
      candidate.documents?.employment?.status
    ];
    // Check if any document exists and is rejected
    return docs.some(s => s === 'rejected');
  };

  // ✅ FIXED: Candidate is Pending when NOT all verified AND NOT rejected
  const candidateIsPending = (candidate) => {
    const docs = [
      candidate.documents?.aadhaar?.status,
      candidate.documents?.pan?.status,
      candidate.documents?.degree?.status,
      candidate.documents?.employment?.status
    ];
    
    // If any document is undefined (not uploaded), it's pending
    if (docs.some(s => s === undefined)) return true;
    
    // If any document is rejected, it's NOT pending (it's rejected)
    if (docs.some(s => s === 'rejected')) return false;
    
    // If ALL documents are verified, it's NOT pending (it's approved)
    if (docs.every(s => s === 'verified')) return false;
    
    // Otherwise, it's pending (some are 'pending')
    return docs.some(s => s === 'pending');
  };

export default HRDashboard;