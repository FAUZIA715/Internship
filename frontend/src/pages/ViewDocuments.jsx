import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, deleteDocument, logout } from '../utils/api';

const ViewDocuments = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
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
      const data = await getDocuments();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
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
      } else {
        alert('Failed to open document');
      }
    } catch (error) {
      alert('Error opening document');
    }
  };

  // Delete document
  const deleteDocumentHandler = async (doc) => {
    const docId = doc.documentId || doc._id;
    try {
      await deleteDocument(docId);
      alert(`✅ ${doc.documentName} deleted successfully!`);
      setDeleteConfirm(null);
      await fetchDocuments();
    } catch (error) {
      alert('❌ Delete failed: ' + error.message);
    }
  };

  const getDocumentIcon = (type) => {
    const icons = {
      aadhaar: 'fas fa-id-card',
      pan: 'fas fa-credit-card',
      degree: 'fas fa-graduation-cap',
      employment: 'fas fa-briefcase',
      address: 'fas fa-home'
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

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  return (
    <div className="view-wrapper">
      <div className="view-container">
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
                  <span>Reset Password</span>
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
        <div className="view-header">
          <h1>My Documents</h1>
          <p>View all your uploaded documents</p>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <h3>Delete Document</h3>
              <p>Are you sure you want to delete <strong>{deleteConfirm.documentName}</strong>?</p>
              <p className="delete-warning">This action cannot be undone.</p>
              <div className="delete-modal-actions">
                <button onClick={() => deleteDocumentHandler(deleteConfirm)} className="confirm-delete-btn">Yes, Delete</button>
                <button onClick={() => setDeleteConfirm(null)} className="cancel-delete-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h3>No documents found</h3>
            <p>You haven't uploaded any documents yet.</p>
            <Link to="/upload" className="btn-primary">Upload Documents</Link>
          </div>
        ) : (
          <div className="documents-list-view">
            {documents.map(doc => (
              <div key={doc._id} className="document-item-view">
                <div className="document-icon-view">
                  <i className={getDocumentIcon(doc.documentType)}></i>
                </div>
                <div className="document-info-view">
                  <div className="document-header-view">
                    <h3>{doc.documentName}</h3>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p className="document-filename-view">
                    <i className="fas fa-file"></i> {doc.fileName}
                  </p>
                  <p className="document-date-view">
                    <i className="fas fa-calendar"></i> Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <p className="rejection-reason-view">
                      <i className="fas fa-exclamation-triangle"></i> Reason: {doc.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="document-actions-view">
                  <button onClick={() => viewDocument(doc)} className="view-btn-view">
                    <i className="fas fa-eye"></i> View
                  </button>
                  <button onClick={() => setDeleteConfirm(doc)} className="delete-btn-view">
                    <i className="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDocuments;