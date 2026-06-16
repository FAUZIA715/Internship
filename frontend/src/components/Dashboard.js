import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, logout, getProfile } from '../services/api';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [verificationSummary, setVerificationSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      if (profileData.success) {
        setUserProfile(profileData.user);
      }
      const docData = await getDocuments();
      if (docData.success) {
        setDocuments(docData.documents || []);
        setVerificationSummary(docData.verificationSummary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message === 'Invalid token' || error.message === 'No token' || error.message === 'Not authorized - no token') {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  };

  const handleForgotPassword = () => {
    setIsDropdownOpen(false);
    navigate('/forgot-password');
  };

  // Calculate stats
  const stats = {
    total: documents?.length || 0,
    verified: documents?.filter(d => d.status === 'verified').length || 0,
    pending: documents?.filter(d => d.status === 'pending').length || 0,
    rejected: documents?.filter(d => d.status === 'rejected').length || 0
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

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i> Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* Header with Profile Dropdown */}
        <div className="dashboard-header">
          <div className="logo-area">
            <div className="logo-icon-small">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="logo-text">VeriFlow</span>
          </div>
          
          {/* Profile Dropdown */}
          <div className="user-area" ref={dropdownRef}>
            <div className="user-info" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div>
                <p className="user-name">{userProfile?.name || 'User'}</p>
                <p className="user-role">{userProfile?.role === 'admin' ? 'Administrator' : userProfile?.role === 'hr' ? 'HR' : 'Candidate'}</p>
              </div>
              <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`}></i>
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <i className="fas fa-user-circle"></i>
                  <div>
                    <p className="dropdown-name">{userProfile?.name}</p>
                    <p className="dropdown-email">{userProfile?.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={handleViewProfile} className="dropdown-item">
                  <i className="fas fa-user"></i>
                  <span>View Profile</span>
                </button>
                <button onClick={handleForgotPassword} className="dropdown-item">
                  <i className="fas fa-key"></i>
                  <span>Forgot Password</span>
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="welcome-section">
          <h1>Welcome back, {userProfile?.name?.split(' ')[0] || 'User'}!</h1>
          <p>Manage your document verification process from one central dashboard.</p>
        </div>

        {/* Stats Cards - Now 4 cards: Total, Verified, Pending, Rejected */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue-100 text-blue-600">
              <i className="fas fa-file-alt"></i>
            </div>
            <div>
              <p className="stat-value">{stats.total}</p>
              <p className="stat-label">Total Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green-100 text-green-600">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <p className="stat-value">{stats.verified}</p>
              <p className="stat-label">Verified</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-yellow-100 text-yellow-600">
              <i className="fas fa-clock"></i>
            </div>
            <div>
              <p className="stat-value">{stats.pending}</p>
              <p className="stat-label">Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-red-100 text-red-600">
              <i className="fas fa-times-circle"></i>
            </div>
            <div>
              <p className="stat-value">{stats.rejected}</p>
              <p className="stat-label">Rejected</p>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default Dashboard;