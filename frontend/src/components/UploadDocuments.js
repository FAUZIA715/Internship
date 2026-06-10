import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments, uploadDocument } from '../services/api';

const UploadDocuments = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Selected files for upload
  const [selectedFiles, setSelectedFiles] = useState({
    aadhaar: null,
    pan: null,
    degree: null,
    employment: null
  });
  
  // Verification status (user confirmed after portal visit)
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  
  // Success message
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchDocuments();
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

  // Open Aadhaar Portal (UIDAI)
  const openAadhaarPortal = () => {
    window.open('https://tathya.uidai.gov.in/access/login?role=resident', '_blank');
    alert('🔗 UIDAI Portal opened in new tab.\n\nPlease complete your Aadhaar verification there.\n\nAfter successful verification, click "Mark Aadhaar as Verified" button below.');
  };

  // Open PAN Portal
  const openPanPortal = () => {
    window.open('https://www.pan.utiitsl.com/PAN_ONLINE/ePANCardHome', '_blank');
    alert('🔗 Income Tax PAN Portal opened in new tab.\n\nPlease complete your PAN verification there.\n\nAfter successful verification, click "Mark PAN as Verified" button below.');
  };

  // Mark Aadhaar as Verified
  const markAadhaarVerified = () => {
    setAadhaarVerified(true);
    alert('✅ Aadhaar verification marked as complete! You can now select your Aadhaar document file.');
  };

  // Mark PAN as Verified
  const markPanVerified = () => {
    setPanVerified(true);
    alert('✅ PAN verification marked as complete! You can now select your PAN document file.');
  };

  // Handle file selection
  const handleFileSelect = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Invalid file format. Please upload PDF, JPG, or PNG files only.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit');
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  // Check if all required documents are selected
  const areAllDocumentsSelected = () => {
    return selectedFiles.aadhaar && 
           selectedFiles.pan && 
           selectedFiles.degree && 
           selectedFiles.employment;
  };

  // Upload all documents
  const handleUploadAll = async () => {
    if (!areAllDocumentsSelected()) {
      alert('Please select all 4 documents before uploading.');
      return;
    }

    if (!aadhaarVerified) {
      alert('Please complete Aadhaar verification first (click "Mark Aadhaar as Verified")');
      return;
    }

    if (!panVerified) {
      alert('Please complete PAN verification first (click "Mark PAN as Verified")');
      return;
    }

    setUploading(true);

    try {
      // Upload each document
      const uploadPromises = [
        uploadDocument(selectedFiles.aadhaar, 'aadhaar', 'Aadhaar Card'),
        uploadDocument(selectedFiles.pan, 'pan', 'PAN Card'),
        uploadDocument(selectedFiles.degree, 'degree', 'Degree Certificate'),
        uploadDocument(selectedFiles.employment, 'employment', 'Employment Proof')
      ];
      
      await Promise.all(uploadPromises);
      
      setSuccessMessage('✅ All 4 documents uploaded successfully!');
      alert('✅ SUCCESS! All 4 documents have been uploaded successfully. They will now be verified by HR.');
      
      // Reset form
      setSelectedFiles({
        aadhaar: null,
        pan: null,
        degree: null,
        employment: null
      });
      setAadhaarVerified(false);
      setPanVerified(false);
      
      // Refresh document list
      await fetchDocuments();
      
    } catch (error) {
      alert('❌ Upload failed: ' + error.message);
    } finally {
      setUploading(false);
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
        <div className="view-header">
          <Link to="/dashboard" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
          <h1>Upload Your Documents</h1>
          <p>Please upload all 4 required documents for verification</p>
        </div>

        {successMessage && (
          <div className="success-banner">
            <i className="fas fa-check-circle"></i> {successMessage}
          </div>
        )}

        {/* Document Upload Cards */}
        <div className="upload-grid">
          {/* Aadhaar Card */}
          <div className="upload-card">
            <div className="upload-card-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <h3>Aadhaar Card</h3>
            <p className="required">Required</p>
            
            {!aadhaarVerified ? (
              <div className="verification-area">
                <button onClick={openAadhaarPortal} className="verify-btn">
                  <i className="fas fa-external-link-alt"></i> Verify on UIDAI Portal
                </button>
                <button onClick={markAadhaarVerified} className="mark-btn">
                  <i className="fas fa-check"></i> Mark Aadhaar as Verified
                </button>
              </div>
            ) : (
              <div className="verified-area">
                <span className="verified-badge"><i className="fas fa-check-circle"></i> Verified ✓</span>
                <label className="file-select-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Select Aadhaar File
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect('aadhaar', e)} hidden />
                </label>
                {selectedFiles.aadhaar && (
                  <p className="file-selected"><i className="fas fa-check"></i> {selectedFiles.aadhaar.name}</p>
                )}
              </div>
            )}
          </div>

          {/* PAN Card */}
          <div className="upload-card">
            <div className="upload-card-icon">
              <i className="fas fa-credit-card"></i>
            </div>
            <h3>PAN Card</h3>
            <p className="required">Required</p>
            
            {!panVerified ? (
              <div className="verification-area">
                <button onClick={openPanPortal} className="verify-btn">
                  <i className="fas fa-external-link-alt"></i> Verify on PAN Portal
                </button>
                <button onClick={markPanVerified} className="mark-btn">
                  <i className="fas fa-check"></i> Mark PAN as Verified
                </button>
              </div>
            ) : (
              <div className="verified-area">
                <span className="verified-badge"><i className="fas fa-check-circle"></i> Verified ✓</span>
                <label className="file-select-btn">
                  <i className="fas fa-cloud-upload-alt"></i> Select PAN File
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect('pan', e)} hidden />
                </label>
                {selectedFiles.pan && (
                  <p className="file-selected"><i className="fas fa-check"></i> {selectedFiles.pan.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Degree Certificate */}
          <div className="upload-card">
            <div className="upload-card-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>Degree Certificate</h3>
            <p className="required">Required</p>
            
            <div className="upload-area-simple">
              <label className="file-select-btn">
                <i className="fas fa-cloud-upload-alt"></i> Select Degree File
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect('degree', e)} hidden />
              </label>
              {selectedFiles.degree && (
                <p className="file-selected"><i className="fas fa-check"></i> {selectedFiles.degree.name}</p>
              )}
            </div>
          </div>

          {/* Employment Proof */}
          <div className="upload-card">
            <div className="upload-card-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <h3>Employment Proof</h3>
            <p className="required">Required</p>
            
            <div className="upload-area-simple">
              <label className="file-select-btn">
                <i className="fas fa-cloud-upload-alt"></i> Select Employment File
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileSelect('employment', e)} hidden />
              </label>
              {selectedFiles.employment && (
                <p className="file-selected"><i className="fas fa-check"></i> {selectedFiles.employment.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Upload All Documents Button */}
        <div className="upload-all-section">
          <button 
            onClick={handleUploadAll} 
            className="upload-all-btn"
            disabled={uploading || !areAllDocumentsSelected() || !aadhaarVerified || !panVerified}
          >
            {uploading ? (
              <><i className="fas fa-spinner fa-spin"></i> Uploading...</>
            ) : (
              <><i className="fas fa-cloud-upload-alt"></i> Upload All Documents</>
            )}
          </button>
          <p className="upload-hint">
            {!areAllDocumentsSelected() && "⚠️ Please select all 4 documents first"}
            {areAllDocumentsSelected() && !aadhaarVerified && "⚠️ Please complete Aadhaar verification first"}
            {areAllDocumentsSelected() && aadhaarVerified && !panVerified && "⚠️ Please complete PAN verification first"}
            {areAllDocumentsSelected() && aadhaarVerified && panVerified && "✅ Ready to upload! Click the button above."}
          </p>
        </div>

        {/* Already Uploaded Documents */}
        {documents.length > 0 && (
          <div className="uploaded-docs">
            <h3>Previously Uploaded Documents</h3>
            <div className="uploaded-list">
              {documents.map(doc => (
                <div key={doc._id} className="uploaded-item">
                  <i className={getDocumentIcon(doc.documentType)}></i>
                  <span>{doc.documentName}</span>
                  <span className={`status ${doc.status}`}>{doc.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadDocuments;