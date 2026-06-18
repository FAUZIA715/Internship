import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { uploadDocument } from '../utils/api';

const UploadDocuments = ({ user }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  const documentTypes = [
    { 
      id: 'aadhaar', 
      name: 'Aadhaar Card', 
      icon: 'fas fa-id-card', 
      required: true, 
      formats: 'PDF, JPG, PNG', 
      maxSize: '5MB'
    },
    { 
      id: 'pan', 
      name: 'PAN Card', 
      icon: 'fas fa-credit-card', 
      required: true, 
      formats: 'PDF, JPG, PNG', 
      maxSize: '5MB'
    },
    { 
      id: 'degree', 
      name: 'Degree Certificate', 
      icon: 'fas fa-graduation-cap', 
      required: true, 
      formats: 'PDF, JPG, PNG', 
      maxSize: '10MB'
    },
    { 
      id: 'employment', 
      name: 'Employment Proof', 
      icon: 'fas fa-briefcase', 
      required: true, 
      formats: 'PDF, JPG, PNG', 
      maxSize: '10MB'
    }
  ];

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ ...message, visible: false }), 4000);
  };

  const handleFileChange = (docType, file) => {
    if (!file) return;

    const maxSize = docType === 'degree' || docType === 'employment' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage(`File size exceeds ${docType === 'degree' || docType === 'employment' ? '10MB' : '5MB'} limit`);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showMessage('Invalid file format. Please upload PDF, JPG, or PNG files only.');
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
        await uploadDocument(docData.file, docType, docInfo.name);
      }
      
      showMessage('✅ All documents uploaded successfully! They will be verified by HR.', false);
      
      setTimeout(() => {
        navigate('/documents');
      }, 2000);
    } catch (error) {
      showMessage(error.message || '❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isDocumentUploaded = (docType) => {
    return !!uploadedDocs[docType];
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-container">
        <div className="upload-header">
          <Link to="/dashboard" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
          <h1>Upload Documents</h1>
          <p>Please upload the required documents for background verification</p>
        </div>

        {message.visible && (
          <div className={`message ${message.isError ? 'error' : 'success'} mb-6`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="documents-grid">
            {documentTypes.map((doc) => (
              <div key={doc.id} className={`document-card ${isDocumentUploaded(doc.id) ? 'uploaded' : ''}`}>
                <div className="document-icon">
                  <i className={doc.icon}></i>
                </div>
                <div className="document-info">
                  <h3>
                    {doc.name}
                    {doc.required && <span className="required-badge">Required</span>}
                  </h3>
                  <p className="document-details">
                    <i className="fas fa-file-alt"></i> {doc.formats}
                  </p>
                  <p className="document-details">
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
                        accept=".pdf,.jpg,.jpeg,.png"
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
              onClick={() => navigate('/dashboard')}
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

        <div className="info-box">
          <i className="fas fa-info-circle"></i>
          <div>
            <strong>Important Notes:</strong>
            <ul>
              <li>All documents will show <strong>"Pending"</strong> status after upload</li>
              <li>HR will review and verify your documents</li>
              <li>You will be notified when documents are verified or rejected</li>
              <li>Accepted formats: PDF, JPG, PNG (max 10MB per file)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;