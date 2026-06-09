import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HRDashboard.css';

const HRDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    pending: 0, 
    approved: 0, 
    rejected: 0,
    autoVerificationComplete: 0,
    hrReviewPending: 0
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
      
      // Calculate stats
      const total = data.length;
      const pending = data.filter(c => c.hrReviewStatus === 'Pending').length;
      const approved = data.filter(c => c.hrReviewStatus === 'Approved').length;
      const rejected = data.filter(c => c.hrReviewStatus === 'Rejected').length;
      
      // Auto-verification complete (all documents verified by system)
      const autoComplete = data.filter(c => {
        const auto = c.autoVerification;
        return auto && auto.aadhaar === 'Verified' && auto.pan === 'Verified' && 
               auto.degree === 'Verified' && auto.employment === 'Verified' && 
               auto.address === 'Verified';
      }).length;
      
      // HR review pending (auto-verification done but HR not reviewed)
      const hrPending = data.filter(c => {
        const auto = c.autoVerification;
        const autoComplete = auto && auto.aadhaar === 'Verified' && auto.pan === 'Verified' && 
                             auto.degree === 'Verified' && auto.employment === 'Verified' && 
                             auto.address === 'Verified';
        return autoComplete && c.hrReviewStatus === 'Pending';
      }).length;
      
      setStats({ total, pending, approved, rejected, autoVerificationComplete: autoComplete, hrReviewPending: hrPending });
      
      // Get pending reviews (candidates ready for HR review)
      const pendingForReview = data.filter(c => {
        const auto = c.autoVerification;
        const autoComplete = auto && auto.aadhaar === 'Verified' && auto.pan === 'Verified' && 
                             auto.degree === 'Verified' && auto.employment === 'Verified' && 
                             auto.address === 'Verified';
        return autoComplete && c.hrReviewStatus === 'Pending';
      });
      setPendingReviews(pendingForReview.slice(0, 5));
      
      // Generate recent activities
      const activities = [];
      data.forEach(c => {
        if (c.hrReviewStatus === 'Approved') {
          activities.push({ candidate: c.fullName, action: 'HR Approved', date: new Date().toLocaleString() });
        } else if (c.hrReviewStatus === 'Rejected') {
          activities.push({ candidate: c.fullName, action: 'HR Rejected', date: new Date().toLocaleString() });
        }
      });
      setRecentActivities(activities.slice(0, 5));
      
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container">Loading Dashboard...</div>;

  return (
    <div className="hr-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="logo-area">
          <div className="logo-icon-small"><i className="fas fa-shield-alt"></i></div>
          <span className="logo-text">HR Dashboard</span>
        </div>
        <div className="user-area">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <div><p className="user-name">HR Administrator</p><p className="user-role">Verification Manager</p></div>
          </div>
          <button onClick={onLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <h1>Welcome back, HR Administrator!</h1>
        <p>Here's your verification summary for today</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total" onClick={() => navigate('/candidates-list?filter=all')}>
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card auto-complete">
          <div className="stat-icon"><i className="fas fa-robot"></i></div>
          <div className="stat-number">{stats.autoVerificationComplete}</div>
          <div className="stat-label">Auto-Verified</div>
        </div>
        <div className="stat-card hr-pending" onClick={() => navigate('/candidates-list?filter=pending')}>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
          <div className="stat-number">{stats.hrReviewPending}</div>
          <div className="stat-label">Awaiting HR Review</div>
        </div>
        <div className="stat-card approved" onClick={() => navigate('/candidates-list?filter=approved')}>
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="dashboard-main">
        
        {/* Left Column: Pending Reviews */}
        <div className="dashboard-column">
          <div className="section-header">
            <h3><i className="fas fa-clock"></i> Pending HR Reviews</h3>
            <button className="view-all-link" onClick={() => navigate('/candidates-list?filter=pending')}>View All →</button>
          </div>
          
          {pendingReviews.length === 0 ? (
            <div className="empty-state-small">
              <i className="fas fa-check-circle"></i>
              <p>No pending reviews. Great job!</p>
            </div>
          ) : (
            <div className="pending-list">
              {pendingReviews.map(c => (
                <div key={c._id} className="pending-item">
                  <div className="pending-avatar"><i className="fas fa-user-circle"></i></div>
                  <div className="pending-info">
                    <div className="pending-name">{c.fullName}</div>
                    <div className="pending-details">{c.positionApplied} • {c.email}</div>
                  </div>
                  <button className="review-now-btn" onClick={() => navigate(`/candidate-details/${c._id}`)}>
                    Review Now →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity */}
        <div className="dashboard-column">
          <div className="section-header">
            <h3><i className="fas fa-history"></i> Recent Activity</h3>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="empty-state-small">
              <i className="fas fa-info-circle"></i>
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <div className="activity-icon">
                    {activity.action.includes('Approved') ? '✅' : '❌'}
                  </div>
                  <div className="activity-details">
                    <div className="activity-candidate">{activity.candidate}</div>
                    <div className="activity-action">{activity.action}</div>
                    <div className="activity-time">{activity.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate('/candidates-list?filter=pending')}>
            <i className="fas fa-clock"></i> Review Pending
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/candidates-list?filter=all')}>
            <i className="fas fa-list"></i> View All Candidates
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/candidates-list?filter=approved')}>
            <i className="fas fa-check-circle"></i> View Approved
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;