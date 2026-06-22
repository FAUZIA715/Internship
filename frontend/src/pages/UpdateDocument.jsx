import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, updateDocument, logout } from '../utils/api';

const UpdateDocument = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const dropdownRef = useRef(null);
  const [error, setError] = useState(null);
  
  // State for tracking which document is being updated
  const [updatingDoc, setUpdatingDoc] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Verification status for updates (Aadhaar & PAN)
  const [updateAadhaarVerified, setUpdateAadhaarVerified] = useState(false);
  const [updatePanVerified, setUpdatePanVerified] = useState(false);
  const [currentUpdateType, setCurrentUpdateType] = useState(null);
  const [currentUpdateDoc, setCurrentUpdateDoc] = useState(null);

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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDocuments();
      
      if (data.success) {
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        } else {
          setDocuments([]);
        }
      } else {
        setError(data.message || 'Failed to load documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem('token');
      const userId = user?.id;
      
      if (userId) {
        const response = await fetch(`http://localhost:5000/api/history/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
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

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    window.location.href = '/candidate/login'; // FIX: use window.location.href
  };

  const goToDashboard = () => {
    navigate('/candidate/dashboard');
  };

  const goToProfile = () => navigate('/profile');
  const goToResetPassword = () => { window.location.href = '/candidate/forgot-password'; }; // FIX: correct route

  // ============ PORTAL REDIRECT FUNCTIONS ============
  
  const openAadhaarPortal = () => {
    window.open('https://myaadhaar.uidai.gov.in/', '_blank');
    alert('🔗 UIDAI Portal opened in new tab.\n\nPlease verify your Aadhaar again for the updated document.\n\nAfter verification, click "Mark Aadhaar as Verified" button.');
  };

  const openPanPortal = () => {
    window.open('https://www.incometax.gov.in/iec/foportal/', '_blank');
    alert('🔗 Income Tax PAN Portal opened in new tab.\n\nPlease verify your PAN again for the updated document.\n\nAfter verification, click "Mark PAN as Verified" button.');
  };

  // ============ UPDATE VERIFICATION ============
  
  const markUpdateAadhaarVerified = () => {
    setUpdateAadhaarVerified(true);
    alert('✅ Aadhaar re-verification complete! You can now upload the updated document.');
  };

  const markUpdatePanVerified = () => {
    setUpdatePanVerified(true);
    alert('✅ PAN re-verification complete! You can now upload the updated document.');
  };

  // ============ HANDLE RE-UPLOAD ============
  
  const handleReuploadClick = (type, doc) => {
    setCurrentUpdateType(type);
    setCurrentUpdateDoc(doc);
    setSelectedFile(null);
    
    if (type === 'aadhaar') {
      setUpdateAadhaarVerified(false);
      openAadhaarPortal();
    } else if (type === 'pan') {
      setUpdatePanVerified(false);
      openPanPortal();
    } else {
      document.getElementById(`reupload-file-${type}`).click();
    }
  };

  const handleFileSelect = (event, type, doc) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file format. Please upload PDF, JPG, or PNG files only.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit');
      return;
    }
    
    setSelectedFile(file);
    setUpdatingDoc(doc);
  };

  const performUpdate = async () => {
    if (!selectedFile || !updatingDoc) {
      alert('No file selected or document not found');
      return;
    }

    // ✅ Use _id for API calls
    const docId = updatingDoc._id;
    
    try {
      await updateDocument(docId, selectedFile);
      alert(`✅ ${updatingDoc.documentName} re-uploaded successfully!`);
      
      setSelectedFile(null);
      setUpdatingDoc(null);
      setCurrentUpdateType(null);
      setCurrentUpdateDoc(null);
      setUpdateAadhaarVerified(false);
      setUpdatePanVerified(false);
      
      await fetchDocuments();
      await fetchHistory();
      
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Update failed: ' + error.message);
    }
  };

  const cancelUpdate = () => {
    setSelectedFile(null);
    setUpdatingDoc(null);
    setCurrentUpdateType(null);
    setCurrentUpdateDoc(null);
    setUpdateAadhaarVerified(false);
    setUpdatePanVerified(false);
  };

  // View document - ✅ Use _id for API calls
  const viewDocument = async (doc) => {
    const docId = doc._id;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/api/documents/download/${docId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        await fetchHistory();
      } else {
        const errorData = await response.json();
        alert('Failed to open document: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error opening document:', error);
      alert('Error opening document: ' + error.message);
    }
  };

  const getDocumentIcon = (type) => {
    const icons = {
      aadhaar: 'fa-id-card',
      pan: 'fa-credit-card',
      degree: 'fa-graduation-cap',
      employment: 'fa-briefcase'
    };
    return icons[type] || 'fa-file-alt';
  };

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

  const getActionIcon = (action) => {
    const colors = {
      UPLOADED: '#3b82f6',
      UPDATED: '#10b981',
      DELETED: '#dc2626',
      VERIFIED: '#10b981',
      REJECTED: '#dc2626',
      VIEWED: '#8b5cf6'
    };
    const icons = {
      UPLOADED: 'fa-cloud-upload-alt',
      UPDATED: 'fa-sync-alt',
      DELETED: 'fa-trash-alt',
      VERIFIED: 'fa-check-circle',
      REJECTED: 'fa-times-circle',
      VIEWED: 'fa-eye'
    };
    return (
      <div className="history-icon-badge" style={{ background: colors[action] || '#6b7280' }}>
        <i className={`fas ${icons[action] || 'fa-clock'}`}></i>
      </div>
    );
  };

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

  const filteredHistory = historyFilter === 'all' 
    ? history 
    : history.filter(h => h.action === historyFilter);

  const historyActions = [
    { value: 'all', label: 'All' },
    { value: 'UPLOADED', label: 'Uploaded' },
    { value: 'UPDATED', label: 'Updated' },
    { value: 'VERIFIED', label: 'Verified' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'DELETED', label: 'Deleted' }
  ];

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
          <h1>Verification Status</h1>
          <p>Track the status of your uploaded documents</p>
        </div>

        {/* ====== ERROR MESSAGE ====== */}
        {error && (
          <div className="error-banner">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {/* ====== UPDATE MODAL ====== */}
        {selectedFile && updatingDoc && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Re-upload Document</h3>
              <p>Are you sure you want to replace <strong>{updatingDoc.documentName}</strong>?</p>
              <p className="modal-file-name">New file: {selectedFile.name}</p>
              <div className="modal-actions">
                <button onClick={performUpdate} className="btn-confirm">Yes, Re-upload</button>
                <button onClick={cancelUpdate} className="btn-cancel">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ====== HIDDEN FILE INPUTS ====== */}
        <input type="file" id="reupload-file-aadhaar" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => {
          const doc = documents.find(d => d.documentType === 'aadhaar');
          if (doc) handleFileSelect(e, 'aadhaar', doc);
        }} />
        <input type="file" id="reupload-file-pan" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => {
          const doc = documents.find(d => d.documentType === 'pan');
          if (doc) handleFileSelect(e, 'pan', doc);
        }} />
        <input type="file" id="reupload-file-degree" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => {
          const doc = documents.find(d => d.documentType === 'degree');
          if (doc) handleFileSelect(e, 'degree', doc);
        }} />
        <input type="file" id="reupload-file-employment" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => {
          const doc = documents.find(d => d.documentType === 'employment');
          if (doc) handleFileSelect(e, 'employment', doc);
        }} />

        {/* ====== DOCUMENTS STATUS LIST ====== */}
        <div className="status-section">
          <h2 className="section-title">Current Documents</h2>
          {documents.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-folder-open"></i>
              <h3>No documents uploaded yet</h3>
              <p>Upload your documents to start the verification process</p>
              <Link to="/upload" className="btn-primary">Upload Documents</Link>
            </div>
          ) : (
            <div className="status-grid">
              {documents.map(doc => (
                <div key={doc._id} className="status-card">
                  <div className="status-card-icon">
                    <i className={`fas ${getDocumentIcon(doc.documentType)}`}></i>
                  </div>
                  <div className="status-card-info">
                    <h3>{doc.documentName}</h3>
                    <p className="file-name-text">
                      <i className="fas fa-file"></i> {doc.fileName}
                    </p>
                    <p className="upload-date">
                      <i className="fas fa-calendar"></i> Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <p className="rejection-reason">
                        <i className="fas fa-exclamation-triangle"></i> Reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="status-card-status">
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="status-card-actions">
                    <button onClick={() => viewDocument(doc)} className="btn-view">
                      <i className="fas fa-eye"></i> View
                    </button>
                    
                    {doc.status === 'rejected' && (
                      <>
                        {doc.documentType === 'aadhaar' && (
                          <div className="reupload-actions">
                            {!updateAadhaarVerified || currentUpdateType !== 'aadhaar' ? (
                              <button onClick={() => handleReuploadClick('aadhaar', doc)} className="btn-reupload">
                                <i className="fas fa-external-link-alt"></i> Re-upload (Verify)
                              </button>
                            ) : (
                              <button onClick={() => document.getElementById('reupload-file-aadhaar').click()} className="btn-reupload ready">
                                <i className="fas fa-cloud-upload-alt"></i> Select File
                              </button>
                            )}
                            {currentUpdateType === 'aadhaar' && !updateAadhaarVerified && (
                              <button onClick={markUpdateAadhaarVerified} className="btn-mark-verify">
                                <i className="fas fa-check"></i> Mark Verified
                              </button>
                            )}
                          </div>
                        )}
                        
                        {doc.documentType === 'pan' && (
                          <div className="reupload-actions">
                            {!updatePanVerified || currentUpdateType !== 'pan' ? (
                              <button onClick={() => handleReuploadClick('pan', doc)} className="btn-reupload">
                                <i className="fas fa-external-link-alt"></i> Re-upload (Verify)
                              </button>
                            ) : (
                              <button onClick={() => document.getElementById('reupload-file-pan').click()} className="btn-reupload ready">
                                <i className="fas fa-cloud-upload-alt"></i> Select File
                              </button>
                            )}
                            {currentUpdateType === 'pan' && !updatePanVerified && (
                              <button onClick={markUpdatePanVerified} className="btn-mark-verify">
                                <i className="fas fa-check"></i> Mark Verified
                              </button>
                            )}
                          </div>
                        )}
                        
                        {(doc.documentType === 'degree' || doc.documentType === 'employment') && (
                          <button onClick={() => handleReuploadClick(doc.documentType, doc)} className="btn-reupload">
                            <i className="fas fa-sync-alt"></i> Re-upload
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====== HISTORY SECTION ====== */}
        <div className="history-section">
          <div className="history-header">
            <h3><i className="fas fa-history"></i> Document Activity History</h3>
            <div className="history-filters">
              {historyActions.map(action => (
                <button
                  key={action.value}
                  className={`filter-btn ${historyFilter === action.value ? 'active' : ''}`}
                  onClick={() => setHistoryFilter(action.value)}
                >
                  {action.label}
                </button>
              ))}
            </div>
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
              {filteredHistory.map(entry => (
                <div key={entry._id} className="history-item">
                  {getActionIcon(entry.action)}
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
        </div>
      </div>

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

        .error-banner {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 12px 16px;
          color: #991b1b;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 1.5rem;
          padding: 2rem;
          max-width: 440px;
          width: 90%;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .modal-content h3 {
          margin: 0 0 8px 0;
          color: #1f2937;
        }
        .modal-content p {
          color: #6b7280;
          margin: 0 0 4px 0;
        }
        .modal-file-name {
          font-weight: 500;
          color: #374151;
          margin: 8px 0 16px 0 !important;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .modal-actions button {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .btn-confirm {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }
        .btn-confirm:hover {
          opacity: 0.9;
        }
        .btn-cancel {
          background: #f3f4f6;
          color: #4b5563;
        }
        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin: 0 0 1rem 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .status-section {
          margin-bottom: 1.5rem;
        }

        .status-grid {
          display: grid;
          gap: 1rem;
        }

        .status-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.25rem 1.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .status-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .status-card-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.3rem;
          flex-shrink: 0;
        }

        .status-card-info {
          flex: 1;
          min-width: 0;
        }
        .status-card-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 2px 0;
        }
        .file-name-text {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }
        .file-name-text i {
          margin-right: 4px;
        }
        .upload-date {
          font-size: 0.8rem;
          color: #9ca3af;
          margin: 2px 0 0 0;
        }
        .upload-date i {
          margin-right: 4px;
        }
        .rejection-reason {
          font-size: 0.8rem;
          color: #dc2626;
          margin: 4px 0 0 0;
        }
        .rejection-reason i {
          margin-right: 4px;
        }

        .status-card-status {
          flex-shrink: 0;
        }

        .status-card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badge-verified {
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
        .badge-rejected {
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

        .btn-view {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          background: #f3f4f6;
          color: #4b5563;
          font-weight: 500;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.2s;
        }
        .btn-view:hover {
          background: #e5e7eb;
        }

        .btn-reupload {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          background: #fef3c7;
          color: #d97706;
          font-weight: 500;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.2s;
        }
        .btn-reupload:hover {
          background: #fde68a;
        }
        .btn-reupload.ready {
          background: #d1fae5;
          color: #059669;
        }
        .btn-reupload.ready:hover {
          background: #a7f3d0;
        }

        .btn-mark-verify {
          padding: 6px 14px;
          border: none;
          border-radius: 8px;
          background: #d1fae5;
          color: #059669;
          font-weight: 500;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background 0.2s;
        }
        .btn-mark-verify:hover {
          background: #a7f3d0;
        }

        .reupload-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
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

        .empty-state {
          background: white;
          border-radius: 1.25rem;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .empty-state i {
          font-size: 3rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }
        .empty-state h3 {
          margin: 0 0 4px 0;
          color: #1f2937;
        }
        .empty-state p {
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .history-section {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem 2rem;
          margin-top: 2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f3f4f6;
          flex-wrap: wrap;
          gap: 12px;
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

        .history-filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 4px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          background: white;
          color: #6b7280;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .filter-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }
        .filter-btn.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
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
          gap: 10px;
        }

        .history-item {
          display: flex;
          gap: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          background: #f9fafb;
          transition: background 0.2s;
          align-items: flex-start;
        }
        .history-item:hover {
          background: #f3f4f6;
        }

        .history-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.85rem;
          flex-shrink: 0;
          margin-top: 2px;
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

        @media (max-width: 1024px) {
          .status-card {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .status-card-icon {
            margin: 0 auto;
          }
          .status-card-status {
            text-align: center;
          }
          .status-card-actions {
            justify-content: center;
          }
          .reupload-actions {
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
          .history-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .history-filters {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 4px;
          }
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 1.4rem;
          }
          .modal-content {
            padding: 1.5rem;
          }
          .status-card {
            padding: 1rem;
          }
          .history-section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateDocument;