import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, updateDocument, logout } from '../services/api';

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
      
      console.log('=== DEBUG: Document API Response ===');
      console.log('Full response:', data);
      console.log('Success:', data.success);
      console.log('Documents:', data.documents);
      
      if (data.success) {
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
          console.log(`✅ Loaded ${data.documents.length} documents`);
        } else {
          console.log('⚠️ No documents found in response');
          setDocuments([]);
        }
      } else {
        console.error('API returned success: false', data.message);
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
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

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
    console.log('Re-upload clicked - Document:', doc);
    
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

    const docId = updatingDoc.documentId || updatingDoc._id;
    
    try {
      const result = await updateDocument(docId, selectedFile);
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

  // View document
  const viewDocument = async (doc) => {
    const docId = doc.documentId || doc._id;
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
        alert('Failed to open document');
      }
    } catch (error) {
      alert('Error opening document');
    }
  };

  const getDocumentIcon = (type) => {
    const icons = {
      aadhaar: 'fas fa-id-card',
      pan: 'fas fa-credit-card',
      degree: 'fas fa-graduation-cap',
      employment: 'fas fa-briefcase'
    };
    return icons[type] || 'fas fa-file-alt';
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return <span className="status-badge-verified"><i className="fas fa-check-circle"></i> Verified</span>;
      case 'pending':
        return <span className="status-badge-pending"><i className="fas fa-clock"></i> Pending</span>;
      case 'rejected':
        return <span className="status-badge-rejected"><i className="fas fa-times-circle"></i> Rejected</span>;
      default:
        return <span className="status-badge-pending">Pending</span>;
    }
  };

  const getActionIcon = (action) => {
    switch(action) {
      case 'UPLOADED': return <i className="fas fa-cloud-upload-alt" style={{ color: '#3b82f6' }}></i>;
      case 'UPDATED': return <i className="fas fa-sync-alt" style={{ color: '#10b981' }}></i>;
      case 'DELETED': return <i className="fas fa-trash-alt" style={{ color: '#dc2626' }}></i>;
      case 'VERIFIED': return <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>;
      case 'REJECTED': return <i className="fas fa-times-circle" style={{ color: '#dc2626' }}></i>;
      case 'VIEWED': return <i className="fas fa-eye" style={{ color: '#8b5cf6' }}></i>;
      default: return <i className="fas fa-clock" style={{ color: '#f59e0b' }}></i>;
    }
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
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  return (
    <div className="verification-wrapper">
      <div className="verification-container">
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
                <p className="user-name">{user?.name || 'User'}</p>
                <p className="user-role">Candidate</p>
              </div>
              <i className={`fas fa-chevron-down dropdown-arrow ${isDropdownOpen ? 'rotate' : ''}`}></i>
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
                <button onClick={goToDashboard} className="dropdown-item">
                  <i className="fas fa-home"></i>
                  <span>Dashboard / Home</span>
                </button>
                <button onClick={() => navigate('/profile')} className="dropdown-item">
                  <i className="fas fa-user"></i>
                  <span>View Profile</span>
                </button>
                <button onClick={() => navigate('/forgot-password')} className="dropdown-item">
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

        {/* Page Title */}
        <div className="verification-header">
          <h1>Verification Status</h1>
          <p>Track the status of your uploaded documents</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {/* Update Confirmation Modal */}
        {selectedFile && updatingDoc && (
          <div className="update-modal-overlay">
            <div className="update-modal">
              <h3>Re-upload Document</h3>
              <p>Are you sure you want to replace <strong>{updatingDoc.documentName}</strong>?</p>
              <p className="update-file-name">New file: {selectedFile.name}</p>
              <div className="update-modal-actions">
                <button onClick={performUpdate} className="confirm-update-btn">Yes, Re-upload</button>
                <button onClick={cancelUpdate} className="cancel-update-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file inputs for re-upload */}
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

        {/* Documents Status List */}
        <div className="status-section">
          <h2 className="section-title">Current Documents</h2>
          {documents.length === 0 ? (
            <div className="empty-state-small">
              <i className="fas fa-folder-open"></i>
              <p>No documents uploaded yet.</p>
              <Link to="/upload" className="btn-primary-small">Upload Documents</Link>
            </div>
          ) : (
            <div className="status-list">
              {documents.map(doc => (
                <div key={doc._id} className="status-card">
                  <div className="status-card-icon">
                    <i className={getDocumentIcon(doc.documentType)}></i>
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
                      <p className="rejection-reason-text">
                        <i className="fas fa-exclamation-triangle"></i> Reason: {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="status-card-status">
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="status-card-actions">
                    <button onClick={() => viewDocument(doc)} className="view-status-btn">
                      <i className="fas fa-eye"></i> View
                    </button>
                    
                    {/* Re-upload button only for rejected documents */}
                    {doc.status === 'rejected' && (
                      <>
                        {doc.documentType === 'aadhaar' && (
                          <div className="reupload-portal-area">
                            {!updateAadhaarVerified || currentUpdateType !== 'aadhaar' ? (
                              <button onClick={() => handleReuploadClick('aadhaar', doc)} className="reupload-btn">
                                <i className="fas fa-external-link-alt"></i> Re-upload (Verify)
                              </button>
                            ) : (
                              <button onClick={() => document.getElementById('reupload-file-aadhaar').click()} className="reupload-btn ready">
                                <i className="fas fa-cloud-upload-alt"></i> Select File
                              </button>
                            )}
                            {currentUpdateType === 'aadhaar' && !updateAadhaarVerified && (
                              <button onClick={markUpdateAadhaarVerified} className="mark-verify-btn">
                                <i className="fas fa-check"></i> Mark Verified
                              </button>
                            )}
                          </div>
                        )}
                        
                        {doc.documentType === 'pan' && (
                          <div className="reupload-portal-area">
                            {!updatePanVerified || currentUpdateType !== 'pan' ? (
                              <button onClick={() => handleReuploadClick('pan', doc)} className="reupload-btn">
                                <i className="fas fa-external-link-alt"></i> Re-upload (Verify)
                              </button>
                            ) : (
                              <button onClick={() => document.getElementById('reupload-file-pan').click()} className="reupload-btn ready">
                                <i className="fas fa-cloud-upload-alt"></i> Select File
                              </button>
                            )}
                            {currentUpdateType === 'pan' && !updatePanVerified && (
                              <button onClick={markUpdatePanVerified} className="mark-verify-btn">
                                <i className="fas fa-check"></i> Mark Verified
                              </button>
                            )}
                          </div>
                        )}
                        
                        {(doc.documentType === 'degree' || doc.documentType === 'employment') && (
                          <button onClick={() => handleReuploadClick(doc.documentType, doc)} className="reupload-btn">
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

        {/* Document Activity History Section */}
        <div className="history-section">
          <div className="history-header">
            <h3><i className="fas fa-history"></i> Document Activity History</h3>
            <div className="history-filters">
              {historyActions.map(action => (
                <button
                  key={action.value}
                  className={`history-filter-btn ${historyFilter === action.value ? 'active' : ''}`}
                  onClick={() => setHistoryFilter(action.value)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {historyLoading ? (
            <div className="loading-history">
              <i className="fas fa-spinner fa-spin"></i> Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="empty-history">
              <i className="fas fa-clock"></i>
              <p>No document activity yet</p>
            </div>
          ) : (
            <div className="history-timeline">
              {filteredHistory.map(entry => (
                <div key={entry._id} className="history-item">
                  <div className="history-icon">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="history-content">
                    <div className="history-title">
                      <span className="history-doc-name">{entry.documentName}</span>
                      <span className={`history-status status-${entry.status}`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="history-action">
                      {getActionText(entry.action)}
                      {entry.details && <span className="history-details"> - {entry.details}</span>}
                    </p>
                    <div className="history-meta">
                      <span className="history-performed-by">
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
    </div>
  );
};

export default UpdateDocument;