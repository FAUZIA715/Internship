import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments, updateDocument, deleteDocument } from '../services/api';

const ViewDocuments = ({ user }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  
  // Verification status for updates
  const [updateAadhaarVerified, setUpdateAadhaarVerified] = useState(false);
  const [updatePanVerified, setUpdatePanVerified] = useState(false);
  const [updateFile, setUpdateFile] = useState(null);
  const [updateDocType, setUpdateDocType] = useState(null);
  const [updateDocId, setUpdateDocId] = useState(null);
  const [updateDocName, setUpdateDocName] = useState(null);

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

  // ============ PORTAL REDIRECT FUNCTIONS ============
  
  // Open Aadhaar Portal for UPDATE
  const openUpdateAadhaarPortal = () => {
    window.open('https://myaadhaar.uidai.gov.in/', '_blank');
    alert('🔗 UIDAI Portal opened in new tab.\n\nPlease verify your Aadhaar again for the updated document.\n\nAfter verification, click "Mark Aadhaar as Verified for Update" button.');
  };

  // Open PAN Portal for UPDATE
  const openUpdatePanPortal = () => {
    window.open('https://www.incometax.gov.in/iec/foportal/', '_blank');
    alert('🔗 Income Tax PAN Portal opened in new tab.\n\nPlease verify your PAN again for the updated document.\n\nAfter verification, click "Mark PAN as Verified for Update" button.');
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

  // ============ HANDLE UPDATE ============
  
  // Handle update click - opens portal for Aadhaar/PAN
  const handleUpdateClick = (type, doc) => {
    setUpdateDocType(type);
    setUpdateDocId(doc.documentId);
    setUpdateDocName(doc.documentName);
    setUpdateFile(null);
    
    if (type === 'aadhaar') {
      setUpdateAadhaarVerified(false);
      openUpdateAadhaarPortal();
    } else if (type === 'pan') {
      setUpdatePanVerified(false);
      openUpdatePanPortal();
    } else {
      // For degree and employment, directly select file
      document.getElementById(`update-file-${type}`).click();
    }
  };

  // Handle file selection for update
  const handleUpdateFileSelect = (event) => {
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

    setUpdateFile(file);
    setUpdating({ type: updateDocType, docId: updateDocId, file: file, docName: updateDocName });
  };

  // Confirm update
  const confirmUpdate = async () => {
    if (!updating) return;
    
    try {
      await updateDocument(updating.docId, updating.file);
      alert(`✅ ${updating.docName} updated successfully!`);
      setUpdating(null);
      setUpdateFile(null);
      setUpdateDocType(null);
      setUpdateDocId(null);
      setUpdateDocName(null);
      setUpdateAadhaarVerified(false);
      setUpdatePanVerified(false);
      await fetchDocuments();
    } catch (error) {
      alert('❌ Update failed: ' + error.message);
    }
  };

  // Cancel update
  const cancelUpdate = () => {
    setUpdating(null);
    setUpdateFile(null);
    setUpdateDocType(null);
    setUpdateDocId(null);
    setUpdateDocName(null);
    setUpdateAadhaarVerified(false);
    setUpdatePanVerified(false);
  };

  // Delete document
  const handleDelete = async (doc) => {
    if (window.confirm(`Are you sure you want to delete your ${doc.documentName}? This action cannot be undone.`)) {
      try {
        await deleteDocument(doc.documentId);
        alert(`✅ ${doc.documentName} deleted successfully!`);
        await fetchDocuments();
      } catch (error) {
        alert('❌ Delete failed: ' + error.message);
      }
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
          <h1>My Documents</h1>
          <p>View, update, or delete your uploaded documents</p>
        </div>

        {/* Update Confirmation Modal */}
        {updating && (
          <div className="update-modal-overlay">
            <div className="update-modal">
              <h3>Update Document</h3>
              <p>Are you sure you want to replace <strong>{updating.docName}</strong>?</p>
              <p className="update-file-name">New file: {updating.file.name}</p>
              <div className="update-modal-actions">
                <button onClick={confirmUpdate} className="confirm-update-btn">Yes, Update</button>
                <button onClick={cancelUpdate} className="cancel-update-btn">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file inputs for updates */}
        <input type="file" id="update-file-aadhaar" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleUpdateFileSelect} />
        <input type="file" id="update-file-pan" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleUpdateFileSelect} />
        <input type="file" id="update-file-degree" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleUpdateFileSelect} />
        <input type="file" id="update-file-employment" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleUpdateFileSelect} />

        {/* Documents Section */}
        {documents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h3>No documents found</h3>
            <p>You haven't uploaded any documents yet.</p>
            <Link to="/upload" className="btn-primary">Upload Documents</Link>
          </div>
        ) : (
          <div className="documents-section">
            <h2>Your Uploaded Documents</h2>
            <div className="existing-docs-grid">
              {documents.map(doc => (
                <div key={doc._id} className="existing-doc-card">
                  <div className="doc-header">
                    <i className={getDocumentIcon(doc.documentType)}></i>
                    <h3>{doc.documentName}</h3>
                    {getStatusBadge(doc.status)}
                  </div>
                  <div className="doc-details">
                    <p><i className="fas fa-file"></i> {doc.fileName}</p>
                    <p><i className="fas fa-calendar"></i> Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                    <p><i className="fas fa-weight-hanging"></i> {(doc.fileSize / 1024).toFixed(2)} KB</p>
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <p className="rejection-reason"><i className="fas fa-exclamation-triangle"></i> {doc.rejectionReason}</p>
                    )}
                  </div>
                  <div className="doc-actions">
                    {/* Aadhaar Update with Portal Redirect */}
                    {doc.documentType === 'aadhaar' && (
                      <div className="update-portal-area">
                        {!updateAadhaarVerified || updateDocType !== 'aadhaar' ? (
                          <button onClick={() => handleUpdateClick('aadhaar', doc)} className="update-doc-btn">
                            <i className="fas fa-external-link-alt"></i> Update Aadhaar
                          </button>
                        ) : (
                          <div className="update-verified-area">
                            <span className="verified-badge-small"><i className="fas fa-check-circle"></i> Verified</span>
                            <button onClick={() => document.getElementById('update-file-aadhaar').click()} className="update-doc-btn">
                              <i className="fas fa-cloud-upload-alt"></i> Select New File
                            </button>
                          </div>
                        )}
                        {updateDocType === 'aadhaar' && !updateAadhaarVerified && (
                          <button onClick={markUpdateAadhaarVerified} className="mark-update-btn">
                            <i className="fas fa-check"></i> Mark Verified
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* PAN Update with Portal Redirect */}
                    {doc.documentType === 'pan' && (
                      <div className="update-portal-area">
                        {!updatePanVerified || updateDocType !== 'pan' ? (
                          <button onClick={() => handleUpdateClick('pan', doc)} className="update-doc-btn">
                            <i className="fas fa-external-link-alt"></i> Update PAN
                          </button>
                        ) : (
                          <div className="update-verified-area">
                            <span className="verified-badge-small"><i className="fas fa-check-circle"></i> Verified</span>
                            <button onClick={() => document.getElementById('update-file-pan').click()} className="update-doc-btn">
                              <i className="fas fa-cloud-upload-alt"></i> Select New File
                            </button>
                          </div>
                        )}
                        {updateDocType === 'pan' && !updatePanVerified && (
                          <button onClick={markUpdatePanVerified} className="mark-update-btn">
                            <i className="fas fa-check"></i> Mark Verified
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Degree & Employment - Direct Update */}
                    {(doc.documentType === 'degree' || doc.documentType === 'employment') && (
                      <>
                        <button onClick={() => document.getElementById(`update-file-${doc.documentType}`).click()} className="update-doc-btn">
                          <i className="fas fa-sync-alt"></i> Update
                        </button>
                        <button onClick={() => handleDelete(doc)} className="delete-doc-btn">
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </>
                    )}
                    
                    {/* Delete for Aadhaar & PAN */}
                    {(doc.documentType === 'aadhaar' || doc.documentType === 'pan') && (
                      <button onClick={() => handleDelete(doc)} className="delete-doc-btn">
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDocuments;