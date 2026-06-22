import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadDocument, logout } from '../utils/api';

const UploadDocuments = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const documentTypes = [
    { 
      id: 'aadhaar', 
      name: 'Aadhaar Card', 
      icon: 'fa-id-card', 
      required: true, 
      formats: 'PDF', 
      maxSize: '5MB'
    },
    { 
      id: 'pan', 
      name: 'PAN Card', 
      icon: 'fa-credit-card', 
      required: true, 
      formats: 'PDF', 
      maxSize: '5MB'
    },
    { 
      id: 'degree', 
      name: 'Degree Certificate', 
      icon: 'fa-graduation-cap', 
      required: true, 
      formats: 'PDF', 
      maxSize: '10MB'
    },
    { 
      id: 'employment', 
      name: 'Employment Proof', 
      icon: 'fa-briefcase', 
      required: true, 
      formats: 'PDF', 
      maxSize: '10MB'
    }
  ];

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ text, isError, visible: false }), 4000);
  };

  const handleLogout = () => {
    logout();
    if (onLogout) onLogout();
    window.location.href = '/candidate/login';
  };

  const goToDashboard = () => navigate('/candidate/dashboard');
  const goToProfile = () => navigate('/profile');
  const goToResetPassword = () => window.location.href = '/candidate/forgot-password';

  const handleFileChange = (docType, file) => {
    if (!file) return;

    const maxSize = docType === 'degree' || docType === 'employment' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage(`File size exceeds ${docType === 'degree' || docType === 'employment' ? '10MB' : '5MB'} limit`);
      return;
    }

    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      showMessage('Invalid file format. Please upload PDF files only.');
      return;
    }

    setUploadedDocs(prev => ({
      ...prev,
      [docType]: { file, fileName: file.name }
    }));
  };

  const removeDocument = (docType) => {
    setUploadedDocs(prev => {
      const newState = { ...prev };
      delete newState[docType];
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredDocs = documentTypes.map(doc => doc.id);
    const uploadedTypes = Object.keys(uploadedDocs);
    const missingRequired = requiredDocs.filter(req => !uploadedTypes.includes(req));
    
    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(m => documentTypes.find(d => d.id === m)?.name).join(', ');
      showMessage(`Please upload required documents: ${missingNames}`);
      return;
    }

    setUploading(true);

    try {
      for (const [docType, docData] of Object.entries(uploadedDocs)) {
        const docInfo = documentTypes.find(d => d.id === docType);
        console.log('📤 Uploading:', docType, docData.file.name);
        const result = await uploadDocument(docData.file, docType, docInfo.name);
        console.log('✅ Upload result:', result);
      }
      
      showMessage('✅ All documents uploaded successfully! They will be verified by HR.', false);
      
      setTimeout(() => {
        navigate('/documents');
      }, 2000);
    } catch (error) {
      console.error('❌ Upload error:', error);
      showMessage(error.message || '❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isDocumentUploaded = (docType) => {
    return !!uploadedDocs[docType];
  };

  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Navbar */}
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

        {/* Page Header */}
        <div className="page-header">
          <h1>Upload Documents</h1>
          <p>Please upload the required documents for background verification</p>
        </div>

        {/* Message */}
        {message.visible && (
          <div className={`message-banner ${message.isError ? 'error' : 'success'}`}>
            <i className={`fas ${message.isError ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
            {message.text}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit}>
          <div className="upload-grid">
            {documentTypes.map((doc) => (
              <div key={doc.id} className={`upload-card ${isDocumentUploaded(doc.id) ? 'uploaded' : ''}`}>
                <div className="upload-card-icon">
                  <i className={`fas ${doc.icon}`}></i>
                </div>
                <div className="upload-card-info">
                  <h3>
                    {doc.name}
                    {doc.required && <span className="required-badge">Required</span>}
                  </h3>
                  <p className="upload-details">
                    <i className="fas fa-file-alt"></i> {doc.formats}
                  </p>
                  <p className="upload-details">
                    <i className="fas fa-weight-hanging"></i> Max {doc.maxSize}
                  </p>
                </div>
                
                {isDocumentUploaded(doc.id) ? (
                  <div className="uploaded-status">
                    <span className="status-badge success">
                      <i className="fas fa-check-circle"></i> Selected
                    </span>
                    <button 
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="remove-btn"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ) : (
                  <div className="upload-area">
                    <label className="upload-btn">
                      <i className="fas fa-cloud-upload-alt"></i> Choose File
                      <input 
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(doc.id, e.target.files[0])}
                        hidden
                      />
                    </label>
                  </div>
                )}
                
                {isDocumentUploaded(doc.id) && (
                  <p className="file-name">
                    <i className="fas fa-paperclip"></i> {uploadedDocs[doc.id]?.fileName}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button 
              type="button" 
              onClick={() => navigate('/candidate/dashboard')}
              className="btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? (
                <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
              ) : (
                <><i className="fas fa-cloud-upload-alt"></i> Upload All Documents</>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="info-box">
          <i className="fas fa-info-circle"></i>
          <div>
            <strong>Important Notes:</strong>
            <ul>
              <li>All documents will show <strong>"Pending"</strong> status after upload</li>
              <li>HR will review and verify your documents</li>
              <li>You will be notified when documents are verified or rejected</li>
              <li>Accepted format: PDF only (max 10MB per file)</li>
            </ul>
          </div>
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

        .message-banner {
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }
        .message-banner.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .message-banner.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .upload-card {
          background: white;
          border-radius: 1.25rem;
          padding: 1.25rem 1.5rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          border: 2px solid transparent;
        }
        .upload-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .upload-card.uploaded {
          border-color: #10b981;
        }

        .upload-card-icon {
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

        .upload-card-info {
          flex: 1;
          min-width: 0;
        }
        .upload-card-info h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 2px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .required-badge {
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 12px;
          background: #fee2e2;
          color: #dc2626;
          font-weight: 500;
        }
        .upload-details {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }
        .upload-details i {
          margin-right: 4px;
        }

        .uploaded-status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-badge {
          font-size: 0.75rem;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
        }
        .status-badge.success {
          background: #d1fae5;
          color: #059669;
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #fee2e2;
          color: #dc2626;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .remove-btn:hover {
          background: #fecaca;
        }

        .upload-area {
          display: flex;
          align-items: center;
        }

        .upload-btn {
          padding: 8px 16px;
          border: 2px dashed #d1d5db;
          border-radius: 10px;
          background: #f9fafb;
          cursor: pointer;
          font-size: 0.85rem;
          color: #6b7280;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .upload-btn:hover {
          border-color: #667eea;
          background: #f3f4f6;
          color: #667eea;
        }

        .file-name {
          font-size: 0.8rem;
          color: #059669;
          margin: 0;
          grid-column: 1 / -1;
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid #f3f4f6;
        }
        .file-name i {
          margin-right: 4px;
        }

        .upload-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-bottom: 2rem;
        }

        .btn-secondary {
          padding: 10px 24px;
          background: white;
          color: #4b5563;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 0.95rem;
        }
        .btn-secondary:hover {
          background: #f3f4f6;
        }
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          padding: 10px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-primary:hover {
          opacity: 0.9;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .info-box {
          background: white;
          border-radius: 1.25rem;
          padding: 1.25rem 1.5rem;
          display: flex;
          gap: 16px;
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
          .upload-grid {
            grid-template-columns: 1fr;
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
          .upload-card {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .upload-card-icon {
            margin: 0 auto;
          }
          .uploaded-status {
            justify-content: center;
          }
          .upload-area {
            justify-content: center;
          }
          .upload-actions {
            flex-direction: column;
          }
          .upload-actions button {
            width: 100%;
            justify-content: center;
          }
          .info-box {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .page-header h1 {
            font-size: 1.4rem;
          }
          .upload-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UploadDocuments;