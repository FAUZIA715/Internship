import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, logout, getDocumentHistory } from '../utils/api';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    completion: 0
  });

  // Fetch documents and history on mount
  useEffect(() => {
    fetchDocuments();
    fetchHistory();
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

  // Fetch documents and update stats
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      
      if (data.success) {
        const docs = data.documents || [];
        setDocuments(docs);
        
        // Calculate stats
        const pending = docs.filter(d => d.status === 'pending').length;
        const verified = docs.filter(d => d.status === 'verified').length;
        const rejected = docs.filter(d => d.status === 'rejected').length;
        const total = docs.length;
        const completion = total > 0 ? Math.round((verified / total) * 100) : 0;
        
        setStats({ pending, verified, rejected, completion });
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch document history
  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      if (userId) {
        // Using api utility for consistency
        const data = await getDocumentHistory(userId);
        if (data.success) {
          setHistory(data.history || []);
        }
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    window.location.href = '/candidate/login';
  };

  // Navigate to pages
  const goToProfile = () => navigate('/profile');
  const goToResetPassword = () => navigate('/candidate/forgot-password');
  const goToUpload = () => navigate('/upload');
  const goToDocuments = () => navigate('/documents');
  const goToVerificationStatus = () => navigate('/verification-status');
  const goToReports = () => navigate('/reports');

  // Format date for history
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Get action icon
  const getActionIcon = (action) => {
    switch(action) {
      case 'UPLOADED': return 'fa-cloud-upload-alt';
      case 'UPDATED': return 'fa-sync-alt';
      case 'DELETED': return 'fa-trash-alt';
      case 'VERIFIED': return 'fa-check-circle';
      case 'REJECTED': return 'fa-times-circle';
      case 'VIEWED': return 'fa-eye';
      default: return 'fa-clock';
    }
  };

  // Get action color
  const getActionColor = (action) => {
    switch(action) {
      case 'UPLOADED': return '#3b82f6';
      case 'UPDATED': return '#10b981';
      case 'DELETED': return '#dc2626';
      case 'VERIFIED': return '#10b981';
      case 'REJECTED': return '#dc2626';
      case 'VIEWED': return '#8b5cf6';
      default: return '#f59e0b';
    }
  };

  // Get action text
  const getActionText = (action) => {
    switch(action) {
      case 'UPLOADED': return 'Document uploaded';
      case 'UPDATED': return 'Document updated';
      case 'DELETED': return 'Document deleted';
      case 'VERIFIED': return 'Document verified by HR';
      case 'REJECTED': return 'Document rejected by HR';
      case 'VIEWED': return 'Document viewed';
      default: return action;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return <span className="badge-verified"><i className="fas fa-check-circle"></i> Verified</span>;
      case 'pending':
        return <span className="badge-pending"><i className="fas fa-clock"></i> Pending</span>;
      case 'rejected':
        return <span className="badge-rejected"><i className="fas fa-times-circle"></i> Rejected</span>;
      default:
        return <span className="badge-pending">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        {/* ====== NAVBAR ====== */}
        <div className="dashboard-navbar">
          <div className="navbar-brand">
            <div className="brand-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="brand-text">VeriFlow</span>
          </div>
          
          {/* Profile Dropdown */}
          <div className="navbar-user" ref={dropdownRef}>
            <div 
              className="user-trigger" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="user-info">
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-role">Candidate</p>
              </div>
              <i className={`fas fa-chevron-down dropdown-chevron ${isDropdownOpen ? 'rotate' : ''}`}></i>
            </div>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <i className="fas fa-user-circle"></i>
                  <div>
                    <p className="dropdown-name">{user?.name}</p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={goToProfile} className="dropdown-item">
                  <i className="fas fa-user"></i>
                  <span>View Profile</span>
                </button>
                <button onClick={goToResetPassword} className="dropdown-item">
                  <i className="fas fa-key"></i>
                  <span>Forgot Password</span>
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====== WELCOME SECTION ====== */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p>Track your document verification status and manage your documents</p>
        </div>

        {/* ====== STATS CARDS ====== */}
        <div className="stats-grid">
          <div className="stat-card stat-pending">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>
          
          <div className="stat-card stat-verified">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <p className="stat-label">Verified</p>
              <p className="stat-value">{stats.verified}</p>
            </div>
          </div>
          
          <div className="stat-card stat-rejected">
            <div className="stat-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-content">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{stats.rejected}</p>
            </div>
          </div>
          
          <div className="stat-card stat-completion">
            <div className="stat-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            <div className="stat-content">
              <p className="stat-label">Completion</p>
              <p className="stat-value">{stats.completion}%</p>
            </div>
          </div>
        </div>

        {/* ====== ACTION CARDS ====== */}
        <div className="action-grid">
          <div className="action-card" onClick={goToUpload}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <h3>Upload Documents</h3>
            <p>Upload your verification documents</p>
            <span className="action-arrow">→</span>
          </div>
          
          <div className="action-card" onClick={goToDocuments}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <i className="fas fa-folder-open"></i>
            </div>
            <h3>View Documents</h3>
            <p>View all uploaded documents</p>
            <span className="action-arrow">→</span>
          </div>
          
          <div className="action-card" onClick={goToVerificationStatus}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <i className="fas fa-check-double"></i>
            </div>
            <h3>Verification Status</h3>
            <p>Check document verification status</p>
            <span className="action-arrow">→</span>
          </div>
          
          <div className="action-card" onClick={goToReports}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
              <i className="fas fa-file-pdf"></i>
            </div>
            <h3>Download Reports</h3>
            <p>Download verification reports</p>
            <span className="action-arrow">→</span>
          </div>
        </div>

        {/* ====== RECENT ACTIVITY ====== */}
        <div className="history-section">
          <div className="history-header">
            <h3><i className="fas fa-history"></i> Recent Activity</h3>
            <span className="history-count">{history.length} activities</span>
          </div>
          
          {historyLoading ? (
            <div className="history-loading">
              <i className="fas fa-spinner fa-spin"></i> Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <i className="fas fa-clock"></i>
              <p>No document activity yet</p>
            </div>
          ) : (
            <div className="history-timeline">
              {history.slice(0, 10).map((entry) => (
                <div key={entry._id} className="history-item">
                  <div className="history-icon" style={{ background: getActionColor(entry.action) }}>
                    <i className={`fas ${getActionIcon(entry.action)}`}></i>
                  </div>
                  <div className="history-content">
                    <div className="history-title">
                      <span className="history-doc-name">{entry.documentName}</span>
                      {getStatusBadge(entry.status)}
                    </div>
                    <p className="history-action-text">
                      {getActionText(entry.action)}
                      {entry.details && <span className="history-details"> - {entry.details}</span>}
                    </p>
                    <div className="history-meta">
                      <span className="history-user">
                        <i className="fas fa-user"></i> {entry.performedByName} ({entry.performedByRole})
                      </span>
                      <span className="history-time">
                        <i className="fas fa-calendar"></i> {formatDate(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {history.length > 10 && (
            <div className="history-view-all">
              <button onClick={goToVerificationStatus} className="view-all-btn">
                View All Activities →
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 1.2rem;
          gap: 12px;
        }
        .dashboard-loading i {
          font-size: 2rem;
        }

        .dashboard-navbar {
          background: white;
          border-radius: 1.5rem;
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          box-shadow: 0 4px 10px rgba(102,126,234,0.3);
        }

        .brand-text {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1f2937;
          letter-spacing: -0.5px;
        }

        .navbar-user {
          position: relative;
        }

        .user-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .user-trigger:hover {
          background: #f3f4f6;
        }

        .user-avatar {
          font-size: 2rem;
          color: #667eea;
        }

        .user-info {
          text-align: left;
        }
        .user-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          line-height: 1.2;
        }
        .user-role {
          font-size: 0.7rem;
          color: #6b7280;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dropdown-chevron {
          color: #9ca3af;
          font-size: 0.8rem;
          transition: transform 0.3s;
        }
        .dropdown-chevron.rotate {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          min-width: 260px;
          padding: 8px 0;
          z-index: 1000;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
        }
        .dropdown-header i {
          font-size: 2.5rem;
          color: #667eea;
        }
        .dropdown-name {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .dropdown-email {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .dropdown-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 6px 12px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 20px;
          background: none;
          border: none;
          font-size: 0.9rem;
          color: #1f2937;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
          text-align: left;
        }
        .dropdown-item:hover {
          background: #f3f4f6;
        }
        .dropdown-item i {
          width: 20px;
          color: #6b7280;
        }
        .dropdown-item.logout {
          color: #dc2626;
        }
        .dropdown-item.logout i {
          color: #dc2626;
        }

        .welcome-section {
          margin-bottom: 2rem;
        }
        .welcome-section h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: white;
          margin: 0 0 4px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .welcome-section p {
          color: rgba(255,255,255,0.8);
          margin: 0;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
        }
        .stat-pending .stat-icon {
          background: #fef3c7;
          color: #d97706;
        }
        .stat-verified .stat-icon {
          background: #d1fae5;
          color: #059669;
        }
        .stat-rejected .stat-icon {
          background: #fee2e2;
          color: #dc2626;
        }
        .stat-completion .stat-icon {
          background: #ede9fe;
          color: #7c3aed;
        }

        .stat-content {
          flex: 1;
        }
        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          line-height: 1.2;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .action-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.5rem;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        .action-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.15);
        }

        .action-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-size: 1.5rem;
          color: white;
        }

        .action-card h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 4px 0;
        }
        .action-card p {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .action-arrow {
          position: absolute;
          top: 12px;
          right: 16px;
          color: #d1d5db;
          font-size: 1.1rem;
          transition: transform 0.2s, color 0.2s;
        }
        .action-card:hover .action-arrow {
          transform: translateX(4px);
          color: #667eea;
        }

        .history-section {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
        }
        .history-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .history-header h3 i {
          color: #667eea;
          margin-right: 8px;
        }
        .history-count {
          font-size: 0.8rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 20px;
        }

        .history-loading {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }
        .history-loading i {
          margin-right: 8px;
        }

        .history-empty {
          text-align: center;
          padding: 2.5rem;
          color: #9ca3af;
        }
        .history-empty i {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .history-empty p {
          margin: 0;
        }

        .history-timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .history-item {
          display: flex;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          background: #f9fafb;
          transition: background 0.2s;
        }
        .history-item:hover {
          background: #f3f4f6;
        }

        .history-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .history-content {
          flex: 1;
          min-width: 0;
        }

        .history-title {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .history-doc-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .badge-verified {
          font-size: 0.7rem;
          padding: 2px 10px;
          border-radius: 20px;
          background: #d1fae5;
          color: #059669;
          font-weight: 500;
        }
        .badge-verified i {
          margin-right: 4px;
        }
        .badge-pending {
          font-size: 0.7rem;
          padding: 2px 10px;
          border-radius: 20px;
          background: #fef3c7;
          color: #d97706;
          font-weight: 500;
        }
        .badge-pending i {
          margin-right: 4px;
        }
        .badge-rejected {
          font-size: 0.7rem;
          padding: 2px 10px;
          border-radius: 20px;
          background: #fee2e2;
          color: #dc2626;
          font-weight: 500;
        }
        .badge-rejected i {
          margin-right: 4px;
        }

        .history-action-text {
          font-size: 0.85rem;
          color: #4b5563;
          margin: 2px 0 4px 0;
        }
        .history-details {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .history-meta {
          display: flex;
          gap: 16px;
          font-size: 0.75rem;
          color: #6b7280;
          flex-wrap: wrap;
        }
        .history-meta i {
          margin-right: 4px;
        }

        .history-view-all {
          text-align: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        .view-all-btn {
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 6px 16px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .view-all-btn:hover {
          background: #f3f4f6;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .action-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .dashboard-wrapper {
            padding: 1rem;
          }
          .dashboard-navbar {
            padding: 0.75rem 1rem;
            flex-wrap: wrap;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .action-grid {
            grid-template-columns: 1fr;
          }
          .stat-card {
            padding: 1rem;
          }
          .stat-value {
            font-size: 1.4rem;
          }
          .history-section {
            padding: 1rem;
          }
          .history-item {
            padding: 10px 12px;
          }
          .welcome-section h1 {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;