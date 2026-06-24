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
    window.location.href = '/candidate/login'; // FIX: use window.location.href
  };

  const goToDashboard = () => navigate('/candidate/dashboard');
  const goToProfile = () => navigate('/profile');
  const goToResetPassword = () => { window.location.href = '/candidate/forgot-password'; }; // FIX: correct route

  // View document - Use _id for API calls
  const [previewUrl, setPreviewUrl] = useState(null);

  const viewDocument = async (doc) => {
    if (doc.filePath && doc.filePath.startsWith('http')) {
      // Use Google Docs viewer to display PDF inline — works on any browser
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(doc.filePath)}&embedded=true`;
      setPreviewUrl(googleViewerUrl);
      return;
    }
    alert('This document was uploaded before Cloudinary integration. Please re-upload it.');
  };

  // Delete document - Use _id for API calls
  const deleteDocumentHandler = async (doc) => {
    const docId = doc._id;
    
    try {
      await deleteDocument(docId);
      alert(`✅ ${doc.documentName} deleted successfully!`);
      setDeleteConfirm(null);
      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Delete failed: ' + error.message);
    }
  };

  const getDocumentIcon = (type) => {
    const icons = {
      aadhaar: 'fa-id-card',
      pan: 'fa-credit-card',
      degree: 'fa-graduation-cap',
      employment: 'fa-briefcase',
      address: 'fa-home'
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '1.2rem',
        gap: '12px'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem' }}></i> Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1.5rem',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* ====== NAVBAR ====== */}
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '0.75rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
              boxShadow: '0 4px 10px rgba(102,126,234,0.3)'
            }}>
              <i className="fas fa-shield-alt"></i>
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1f2937', letterSpacing: '-0.5px' }}>VeriFlow</span>
          </div>
          
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '12px',
                transition: 'background 0.2s'
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '2rem', color: '#667eea' }}>
                <i className="fas fa-user-circle"></i>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', margin: 0, lineHeight: '1.2' }}>{user?.name || 'User'}</p>
                <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Candidate</p>
              </div>
              <i className={`fas fa-chevron-down ${isDropdownOpen ? 'rotate' : ''}`} style={{ color: '#9ca3af', fontSize: '0.8rem', transition: 'transform 0.3s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }}></i>
            </div>
            
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                minWidth: '260px',
                padding: '8px 0',
                zIndex: 1000,
                animation: 'slideDown 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px' }}>
                  <i className="fas fa-user-circle" style={{ fontSize: '2.5rem', color: '#667eea' }}></i>
                  <div>
                    <p style={{ fontWeight: 600, color: '#1f2937', margin: 0 }}>{user?.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{user?.email}</p>
                  </div>
                </div>
                <div style={{ height: '1px', background: '#e5e7eb', margin: '6px 12px' }}></div>
                <button onClick={goToDashboard} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#1f2937',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                  textAlign: 'left'
                }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <i className="fas fa-home" style={{ width: '20px', color: '#6b7280' }}></i>
                  <span>Home</span>
                </button>
                <button onClick={goToProfile} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#1f2937',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                  textAlign: 'left'
                }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <i className="fas fa-user" style={{ width: '20px', color: '#6b7280' }}></i>
                  <span>View Profile</span>
                </button>
                <button onClick={goToResetPassword} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#1f2937',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                  textAlign: 'left'
                }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <i className="fas fa-key" style={{ width: '20px', color: '#6b7280' }}></i>
                  <span>Reset Password</span>
                </button>
                <div style={{ height: '1px', background: '#e5e7eb', margin: '6px 12px' }}></div>
                <button onClick={handleLogout} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#dc2626',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                  textAlign: 'left'
                }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <i className="fas fa-sign-out-alt" style={{ width: '20px', color: '#dc2626' }}></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====== PAGE HEADER ====== */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', margin: '0 0 4px 0', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>My Documents</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '1rem' }}>View all your uploaded documents</p>
        </div>

        {/* ====== PDF PREVIEW MODAL ====== */}
        {previewUrl && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 3000
          }}>
            <div style={{ width: '90%', height: '90%', background: 'white', borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#1f2937' }}>Document Preview</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={previewUrl.replace('https://docs.google.com/viewer?url=', '').replace('&embedded=true', '').split('?')[0]} target="_blank" rel="noreferrer" style={{ padding: '6px 14px', background: '#667eea', color: 'white', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>⬇️ Download</a>
                  <button onClick={() => setPreviewUrl(null)} style={{ padding: '6px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✕ Close</button>
                </div>
              </div>
              <iframe src={previewUrl} style={{ flex: 1, border: 'none', width: '100%' }} title="Document Preview" />
            </div>
          </div>
        )}

        {/* ====== DELETE MODAL ====== */}
        {deleteConfirm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '1.5rem',
              padding: '2rem',
              maxWidth: '440px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Delete Document</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>Are you sure you want to delete <strong>{deleteConfirm.documentName}</strong>?</p>
              <p style={{ color: '#dc2626', fontWeight: 500, marginTop: '4px' }}>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => deleteDocumentHandler(deleteConfirm)} style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: '#dc2626',
                  color: 'white'
                }}>Yes, Delete</button>
                <button onClick={() => setDeleteConfirm(null)} style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  background: '#f3f4f6',
                  color: '#4b5563'
                }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ====== DOCUMENTS LIST ====== */}
        {documents.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '1.25rem',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#d1d5db', marginBottom: '1rem' }}></i>
            <h3 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>No documents found</h3>
            <p style={{ color: '#6b7280', margin: '0 0 1.5rem 0' }}>You haven't uploaded any documents yet.</p>
            <Link to="/upload" style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer'
            }}>Upload Documents</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {documents.map(doc => (
              <div key={doc._id} style={{
                background: 'white',
                borderRadius: '1.25rem',
                padding: '1.25rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                alignItems: 'center',
                gap: '1.25rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.4rem',
                  flexShrink: 0
                }}>
                  <i className={`fas ${getDocumentIcon(doc.documentType)}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>{doc.documentName}</h3>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '2px 0 0 0' }}>
                    <i className="fas fa-file" style={{ marginRight: '4px' }}></i> {doc.fileName}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>
                    <i className="fas fa-calendar" style={{ marginRight: '4px' }}></i> Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <p style={{ fontSize: '0.8rem', color: '#dc2626', margin: '4px 0 0 0' }}>
                      <i className="fas fa-exclamation-triangle" style={{ marginRight: '4px' }}></i> Reason: {doc.rejectionReason}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => viewDocument(doc)} style={{
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}><i className="fas fa-eye"></i> View</button>
                  <button onClick={() => setDeleteConfirm(doc)} style={{
                    padding: '6px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}><i className="fas fa-trash-alt"></i> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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
        @media (max-width: 768px) {
          .document-item {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .document-icon {
            margin: 0 auto !important;
          }
          .document-header {
            justify-content: center !important;
          }
          .document-actions {
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ViewDocuments;