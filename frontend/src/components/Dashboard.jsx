// components/Dashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    { 
      title: 'Upload Documents', 
      icon: 'fas fa-cloud-upload-alt', 
      description: 'Upload Aadhaar, PAN, Degree, Employment and Address proofs',
      path: '/upload',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'View Documents', 
      icon: 'fas fa-folder-open', 
      description: 'View all uploaded documents with verification status',
      path: '/documents',
      color: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'Verification Status', 
      icon: 'fas fa-check-circle', 
      description: 'Track your background verification progress',
      path: '/documents',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Download Reports', 
      icon: 'fas fa-file-alt', 
      description: 'Download verification reports and summaries',
      path: '/documents',
      color: 'from-orange-500 to-red-500'
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="logo-area">
            <div className="logo-icon-small">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="logo-text">VeriFlow</span>
          </div>
          
          <div className="user-area">
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <div>
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-role">{user?.role === 'admin' ? 'Administrator' : 'Candidate'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p>Manage your document verification process from one central dashboard.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue-100 text-blue-600">
              <i className="fas fa-file-alt"></i>
            </div>
            <div>
              <p className="stat-value">4</p>
              <p className="stat-label">Documents Uploaded</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green-100 text-green-600">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <p className="stat-value">2</p>
              <p className="stat-label">Verified</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-yellow-100 text-yellow-600">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <p className="stat-value">2</p>
              <p className="stat-label">Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-purple-100 text-purple-600">
              <i className="fas fa-chart-line"></i>
            </div>
            <div>
              <p className="stat-value">75%</p>
              <p className="stat-label">Completion</p>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="menu-grid">
          {menuItems.map((item, index) => (
            <Link to={item.path} key={index} className="menu-card">
              <div className={`menu-icon ${item.color}`}>
                <i className={item.icon}></i>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <span className="menu-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="recent-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon bg-green-100 text-green-600">
                <i className="fas fa-check"></i>
              </div>
              <div className="activity-details">
                <p className="activity-title">Aadhaar Card verified successfully</p>
                <p className="activity-time">Today, 10:30 AM</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon bg-blue-100 text-blue-600">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <div className="activity-details">
                <p className="activity-title">PAN Card uploaded for verification</p>
                <p className="activity-time">Yesterday, 3:45 PM</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon bg-yellow-100 text-yellow-600">
                <i className="fas fa-hourglass-half"></i>
              </div>
              <div className="activity-details">
                <p className="activity-title">Educational verification in progress</p>
                <p className="activity-time">Jan 15, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;