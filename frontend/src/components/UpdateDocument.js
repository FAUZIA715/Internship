import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { updateDocument } from '../services/api';

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

    if (file.size > 10 * 1024 * 1024) {
      showMessage('File size exceeds 10MB limit');
      return;
    }

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

    try {
      await updateDocument(document.documentId, selectedFile);
      showMessage('✅ Document updated successfully!', false);
      
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
    } catch (error) {
      showMessage(error.message || 'Update failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="update-wrapper">
      <div className="update-container">
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
                  <span><i className="fas fa-weight-hanging"></i> {(document.fileSize / 1024).toFixed(2)} KB</span>
                </p>
              </div>
            </div>
          </div>

          <div className="upload-new-document">
            <h3>Upload New Document</h3>
            <form onSubmit={handleSubmit}>
              <div className="file-upload-area">
                <label className="file-upload-label">
                  <div className="upload-icon">
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <p className="upload-text">
                    {selectedFile ? selectedFile.name : 'Click to choose a file'}
                  </p>
                  <input 
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>
              </div>
              
              <div className="update-actions">
                <button type="button" onClick={() => navigate('/documents')} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading || !selectedFile}>
                  {uploading ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : <>Update Document</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateDocument;