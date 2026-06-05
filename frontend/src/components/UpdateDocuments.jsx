// components/UpdateDocument.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const UpdateDocument = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const document = location.state?.document;
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  if (!document) {
    navigate('/documents');
    return null;
  }

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ ...message, visible: false }), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showMessage('File size exceeds 10MB limit');
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showMessage('Invalid file format. Please upload PDF, JPG, or PNG files only.');
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      showMessage('Please select a file to upload');
      return;
    }

    setUploading(true);

    setTimeout(() => {
      // Update document in localStorage
      const storedDocs = JSON.parse(localStorage.getItem('userDocuments') || '[]');
      const updatedDocs = storedDocs.map(doc => {
        if (doc.id === document.id) {
          return {
            ...doc,
            fileName: selectedFile.name,
            fileSize: (selectedFile.size / 1024).toFixed(2) + ' KB',
            uploadDate: new Date().toISOString(),
            status: 'pending', // Reset status to pending for re-verification
            rejectionReason: null
          };
        }
        return doc;
      });
      
      localStorage.setItem('userDocuments', JSON.stringify(updatedDocs));
      
      showMessage('✅ Document updated successfully! Redirecting...', false);
      setUploading(false);
      
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
    }, 1500);
  };

  return (
    <div className="update-wrapper">
      <div className="update-container">
        {/* Header */}
        <div className="update-header">
          <Link to="/documents" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Documents
          </Link>
          <h1>Update Document</h1>
          <p>Replace your existing document with a new version</p>
        </div>

        {message.visible && (
          <div className={`message ${message.isError ? 'error' : 'success'} mb-6`}>
            {message.text}
          </div>
        )}

        <div className="update-card">
          <div className="current-document">
            <h3>Current Document</h3>
            <div className="current-doc-info">
              <div className="doc-preview-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="doc-details">
                <p className="doc-name">{document.documentName}</p>
                <p className="doc-meta">
                  <span><i className="fas fa-file"></i> {document.fileName}</span>
                  <span><i className="fas fa-weight-hanging"></i> {document.fileSize}</span>
                  <span><i className="fas fa-calendar"></i> {new Date(document.uploadDate).toLocaleDateString()}</span>
                </p>
                <p className="doc-status">
                  Status: 
                  <span className={`status-badge ${document.status}`}>
                    {document.status === 'verified' ? 'Verified' : document.status === 'pending' ? 'Pending' : 'Rejected'}
                  </span>
                </p>
                {document.status === 'rejected' && document.rejectionReason && (
                  <p className="rejection-note">
                    <i className="fas fa-exclamation-triangle"></i> Rejection Reason: {document.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="upload-new-document">
            <h3>Upload New Document</h3>
            <p className="upload-note">Please upload a clear and legible copy of your {document.documentName}</p>
            
            <form onSubmit={handleSubmit}>
              <div className="file-upload-area">
                <label className="file-upload-label">
                  <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p className="upload-text">
                    {selectedFile ? selectedFile.name : 'Click to choose a file or drag and drop'}
                  </p>
                  <p className="upload-hint">PDF, JPG, PNG (Max 10MB)</p>
                  <input 
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
              </div>
              
              <div className="update-actions">
                <button 
                  type="button" 
                  onClick={() => navigate('/documents')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Updating...</>
                  ) : (
                    <><i className="fas fa-sync-alt"></i> Update Document</>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="info-note">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Note:</strong> After updating, your document will be marked as "Pending" and will need to be verified again by our team.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDocument;