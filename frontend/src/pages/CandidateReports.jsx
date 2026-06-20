import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getReports, downloadReport, checkReportStatus, logout } from '../utils/api';

const CandidateReports = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchReports();
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

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      if (data.success) {
        setReports(data.reports || []);
        setHasReport(data.reports && data.reports.length > 0);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    navigate('/candidate/login');
  };

  const goToDashboard = () => navigate('/candidate/dashboard');
  const goToProfile = () => navigate('/profile');
  const goToResetPassword = () => navigate('/candidate/change-password');

  const handleDownload = async (reportId) => {
    try {
      setDownloading(true);
      await downloadReport(reportId);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'generated':
        return <span className="badge-success"><i className="fas fa-check-circle"></i> Generated</span>;
      case 'pending':
        return <span className="badge-pending"><i className="fas fa-clock"></i> Pending</span>;
      case 'failed':
        return <span className="badge-danger"><i className="fas fa-times-circle"></i> Failed</span>;
      default:
        return <span className="badge-pending">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* ====== NAVBAR ====== */}
        <div className="page-navbar">
          <div className="navbar-brand">
            <div className="brand-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <span className="brand-text">VeriFlow</span>
          </div>
          
          <div className="navbar-user" ref={dropdownRef}>
            <div className="user-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="user-info">
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-role">Candidate</p>
              </div>
              <i className={`fas fa-chevron-down dropdown-chevron ${isDropdownOpen ? 'rotate' : ''}`}></i>
            </div>
            
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
                <button onClick={goToDashboard} className="dropdown-item">
                  <i className="fas fa-home"></i>
                  <span>Home</span>
                </button>
                <button onClick={goToProfile} className="dropdown-item">
                  <i className="fas fa-user"></i>
                  <span>View Profile</span>
                </button>
                <button onClick={goToResetPassword} className="dropdown-item">
                  <i className="fas fa-key"></i>
                  <span>Reset Password</span>
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

        {/* ====== PAGE HEADER ====== */}
        <div className="page-header">
          <h1>My Reports</h1>
          <p>View and download your background verification reports</p>
        </div>

        {/* ====== REPORTS LIST ====== */}
        {reports.length === 0 ? (
        <div className="empty-state">
            <i className="fas fa-file-pdf"></i>
            <h3>No Reports Available</h3>
            <p>Your background verification report has not been generated yet.</p>
            <p className="empty-hint">Please wait for HR to verify all your documents and generate the report.</p>
            <div className="empty-actions">
            <Link to="/verification-status" className="btn-primary">
                <i className="fas fa-check-double"></i> Check Verification Status
            </Link>
            <Link to="/documents" className="btn-secondary">
                <i className="fas fa-folder-open"></i> View Documents
            </Link>
            </div>
        </div>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report._id} className="report-card">
                <div className="report-icon">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="report-info">
                  <h3>{report.reportName || 'Background Verification Report'}</h3>
                  <p className="report-meta">
                    <i className="fas fa-calendar"></i> Generated: {formatDate(report.generatedAt)}
                  </p>
                  <p className="report-meta">
                    <i className="fas fa-user"></i> Generated by: {report.generatedByName || 'HR'}
                  </p>
                  <div className="report-status">
                    {getStatusBadge(report.status)}
                  </div>
                  {report.isDownloaded && (
                    <p className="report-downloaded">
                      <i className="fas fa-check-circle"></i> Downloaded on {formatDate(report.downloadedAt)}
                    </p>
                  )}
                </div>
                <div className="report-actions">
                  {report.status === 'generated' ? (
                    <button 
                      onClick={() => handleDownload(report.reportId)} 
                      className="btn-download"
                      disabled={downloading}
                    >
                      {downloading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Downloading...</>
                      ) : (
                        <><i className="fas fa-download"></i> Download Report</>
                      )}
                    </button>
                  ) : (
                    <button className="btn-disabled" disabled>
                      <i className="fas fa-clock"></i> Processing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ====== INFO BOX ====== */}
        <div className="info-box">
          <i className="fas fa-info-circle"></i>
          <div>
            <strong>About Reports:</strong>
            <ul>
              <li>Reports are generated by HR after all your documents are verified</li>
              <li>You will see the report here once it's generated</li>
              <li>Reports include all verified documents and their status</li>
              <li>You can download the report anytime from this page</li>
            </ul>
          </div>
        </div>

        {/* ====== CSS ====== */}
        <style>{`
          .page-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 1.5rem;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }

          .page-container {
            max-width: 1200px;
            margin: 0 auto;
          }
           .btn-secondary {
            display: inline-block;
            padding: 10px 24px;
            background: white;
            color: #4b5563;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
            }
            .btn-secondary:hover {
            background: #f9fafb;
            border-color: #d1d5db;
            }
            .empty-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 8px;
            }
          .page-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-size: 1.2rem;
            gap: 12px;
          }
          .page-loading i {
            font-size: 2rem;
          }

          .page-navbar {
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

          .page-header {
            margin-bottom: 2rem;
          }
          .page-header h1 {
            font-size: 1.8rem;
            font-weight: 700;
            color: white;
            margin: 0 0 4px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .page-header p {
            color: rgba(255,255,255,0.8);
            margin: 0;
            font-size: 1rem;
          }

          .empty-state {
            background: white;
            border-radius: 1.25rem;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .empty-state i {
            font-size: 4rem;
            color: #d1d5db;
            margin-bottom: 1rem;
          }
          .empty-state h3 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 1.5rem;
          }
          .empty-state p {
            color: #6b7280;
            margin: 0 0 4px 0;
          }
          .empty-hint {
            color: #9ca3af !important;
            font-size: 0.9rem !important;
            margin-bottom: 24px !important;
          }

          .btn-primary {
            display: inline-block;
            padding: 10px 24px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn-primary:hover {
            opacity: 0.9;
          }

          .reports-grid {
            display: grid;
            gap: 1rem;
          }

          .report-card {
            background: white;
            border-radius: 1.25rem;
            padding: 1.5rem 2rem;
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            gap: 1.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .report-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          }

          .report-icon {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #dc2626, #ef4444);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.6rem;
            flex-shrink: 0;
          }

          .report-info {
            flex: 1;
          }
          .report-info h3 {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 4px 0;
          }
          .report-meta {
            font-size: 0.85rem;
            color: #6b7280;
            margin: 2px 0;
          }
          .report-meta i {
            margin-right: 6px;
          }
          .report-status {
            margin-top: 6px;
          }
          .report-downloaded {
            font-size: 0.8rem;
            color: #059669;
            margin: 4px 0 0 0;
          }
          .report-downloaded i {
            margin-right: 4px;
          }

          .badge-success {
            font-size: 0.75rem;
            padding: 4px 12px;
            border-radius: 20px;
            background: #d1fae5;
            color: #059669;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .badge-pending {
            font-size: 0.75rem;
            padding: 4px 12px;
            border-radius: 20px;
            background: #fef3c7;
            color: #d97706;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .badge-danger {
            font-size: 0.75rem;
            padding: 4px 12px;
            border-radius: 20px;
            background: #fee2e2;
            color: #dc2626;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }

          .report-actions {
            display: flex;
            gap: 10px;
            flex-shrink: 0;
          }

          .btn-download {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .btn-download:hover {
            opacity: 0.9;
          }
          .btn-download:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .btn-disabled {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            background: #f3f4f6;
            color: #9ca3af;
            font-weight: 600;
            cursor: not-allowed;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .info-box {
            background: white;
            border-radius: 1.25rem;
            padding: 1.25rem 1.5rem;
            display: flex;
            gap: 16px;
            margin-top: 2rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .info-box i {
            font-size: 1.5rem;
            color: #667eea;
            flex-shrink: 0;
            margin-top: 2px;
          }
          .info-box strong {
            color: #1f2937;
          }
          .info-box ul {
            margin: 4px 0 0 0;
            padding-left: 20px;
            color: #6b7280;
            font-size: 0.9rem;
          }
          .info-box ul li {
            margin-bottom: 2px;
          }

          @media (max-width: 1024px) {
            .report-card {
              grid-template-columns: 1fr;
              text-align: center;
            }
            .report-icon {
              margin: 0 auto;
            }
            .report-actions {
              justify-content: center;
            }
          }

          @media (max-width: 768px) {
            .page-wrapper {
              padding: 1rem;
            }
            .page-navbar {
              padding: 0.75rem 1rem;
              flex-wrap: wrap;
            }
            .report-card {
              padding: 1.25rem;
            }
            .report-actions {
              flex-direction: column;
              width: 100%;
            }
            .report-actions button {
              width: 100%;
              justify-content: center;
            }
          }

          @media (max-width: 480px) {
            .page-header h1 {
              font-size: 1.4rem;
            }
            .empty-state {
              padding: 2rem 1rem;
            }
            .empty-state i {
              font-size: 3rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CandidateReports;