// components/UploadDocuments.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const UploadDocuments = ({ user }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  const documentTypes = [
    { id: 'aadhaar', name: 'Aadhaar Card', icon: 'fas fa-id-card', required: true, formats: 'PDF, JPG, PNG', maxSize: '5MB' },
    { id: 'pan', name: 'PAN Card', icon: 'fas fa-credit-card', required: true, formats: 'PDF, JPG, PNG', maxSize: '5MB' },
    { id: 'degree', name: 'Degree Certificate', icon: 'fas fa-graduation-cap', required: false, formats: 'PDF, JPG, PNG', maxSize: '10MB' },
    { id: 'employment', name: 'Employment Proof', icon: 'fas fa-briefcase', required: false, formats: 'PDF, JPG, PNG', maxSize: '10MB' },
    { id: 'address', name: 'Address Proof', icon: 'fas fa-home', required: true, formats: 'PDF, JPG, PNG', maxSize: '5MB' },
  ];

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ ...message, visible: false }), 4000);
  };

  const handleFileChange = (docType, file) => {
    if (!file) return;

    // Validate file size (max 10MB = 10 * 1024 * 1024 bytes)
    const maxSize = docType === 'degree' || docType === 'employment' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage(`File size exceeds ${docType === 'degree' || docType === 'employment' ? '10MB' : '5MB'} limit`);
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showMessage('Invalid file format. Please upload PDF, JPG, or PNG files only.');
      return;
    }

    setUploadedDocs(prev => {
      const existing = prev.find(doc => doc.type === docType);
      if (existing) {
        return prev.map(doc => doc.type === docType ? { ...doc, file, fileName: file.name } : doc);
      }
      return [...prev, { type: docType, file, fileName: file.name }];
    });
  };

  const removeDocument = (docType) => {
    setUploadedDocs(prev => prev.filter(doc => doc.type !== docType));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check required documents
    const requiredDocs = documentTypes.filter(doc => doc.required).map(doc => doc.id);
    const uploadedTypes = uploadedDocs.map(doc => doc.type);
    const missingRequired = requiredDocs.filter(req => !uploadedTypes.includes(req));
    
    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(m => documentTypes.find(d => d.id === m)?.name).join(', ');
      showMessage(`Please upload required documents: ${missingNames}`);
      return;
    }

    setUploading(true);
    
    // Simulate API upload
    setTimeout(() => {
      // Store uploaded documents in localStorage for demo
      const existingDocs = JSON.parse(localStorage.getItem('userDocuments') || '[]');
      const newDocs = uploadedDocs.map(doc => ({
        id: `${doc.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        candidateId: user?.id || 'CAND-001',
        documentType: doc.type,
        documentName: documentTypes.find(d => d.id === doc.type)?.name,
        fileName: doc.fileName,
        fileSize: (doc.file.size / 1024).toFixed(2) + ' KB',
        uploadDate: new Date().toISOString(),
        status: 'pending',
        file: doc.file.name // In real app, you'd store file reference
      }));
      
      const updatedDocs = [...existingDocs, ...newDocs];
      localStorage.setItem('userDocuments', JSON.stringify(updatedDocs));
      
      showMessage('✅ Documents uploaded successfully! Redirecting to documents page...', false);
      setUploading(false);
      
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
    }, 2000);
  };

  const isDocumentUploaded = (docType) => {
    return uploadedDocs.some(doc => doc.type === docType);
  };

  return (
    <div className="upload-wrapper">
      <div className="upload-container">
        {/* Header */}
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
                      <i className="fas fa-check-circle"></i> Uploaded
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
                    <i className="fas fa-paperclip"></i> {uploadedDocs.find(d => d.type === doc.id)?.fileName}
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
              <li>All documents will be verified by our team within 2-3 business days</li>
              <li>Make sure documents are clear and legible</li>
              <li>For Aadhaar and PAN, you will be redirected to official portals for verification</li>
              <li>Accepted formats: PDF, JPG, PNG (max 10MB per file)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocuments;