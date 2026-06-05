// components/ViewDocuments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ViewDocuments = ({ user }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load documents from localStorage
    const storedDocs = JSON.parse(localStorage.getItem('userDocuments') || '[]');
    // Add some demo documents if none exist
    if (storedDocs.length === 0) {
      const demoDocs = [
        {
          id: 'aadhaar_001',
          candidateId: 'CAND-001',
          documentType: 'aadhaar',
          documentName: 'Aadhaar Card',
          fileName: 'aadhaar_card.pdf',
          fileSize: '245 KB',
          uploadDate: '2025-01-10T10:30:00.000Z',
          status: 'verified',
          verifiedDate: '2025-01-12T14:20:00.000Z'
        },
        {
          id: 'pan_001',
          candidateId: 'CAND-001',
          documentType: 'pan',
          documentName: 'PAN Card',
          fileName: 'pan_card.jpg',
          fileSize: '128 KB',
          uploadDate: '2025-01-10T10:35:00.000Z',
          status: 'pending',
        },
        {
          id: 'degree_001',
          candidateId: 'CAND-001',
          documentType: 'degree',
          documentName: 'Degree Certificate',
          fileName: 'btech_degree.pdf',
          fileSize: '1.2 MB',
          uploadDate: '2025-01-11T09:15:00.000Z',
          status: 'pending',
        },
        {
          id: 'address_001',
          candidateId: 'CAND-001',
          documentType: 'address',
          documentName: 'Address Proof',
          fileName: 'electricity_bill.pdf',
          fileSize: '512 KB',
          uploadDate: '2025-01-11T09:20:00.000Z',
          status: 'rejected',
          rejectionReason: 'Document is not clear, please upload a clearer copy'
        }
      ];
      localStorage.setItem('userDocuments', JSON.stringify(demoDocs));
      setDocuments(demoDocs);
    } else {
      setDocuments(storedDocs);
    }
    setLoading(false);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return <span className="status-badge verified"><i className="fas fa-check-circle"></i> Verified</span>;
      case 'pending':
        return <span className="status-badge pending"><i className="fas fa-clock"></i> Pending</span>;
      case 'rejected':
        return <span className="status-badge rejected"><i className="fas fa-times-circle"></i> Rejected</span>;
      default:
        return <span className="status-badge pending">Pending</span>;
    }
  };

  const getDocumentIcon = (type) => {
    switch(type) {
      case 'aadhaar': return 'fas fa-id-card';
      case 'pan': return 'fas fa-credit-card';
      case 'degree': return 'fas fa-graduation-cap';
      case 'employment': return 'fas fa-briefcase';
      case 'address': return 'fas fa-home';
      default: return 'fas fa-file-alt';
    }
  };

  const handleUpdate = (doc) => {
    navigate(`/update/${doc.id}`, { state: { document: doc } });
  };

  const handleDelete = (docId) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      localStorage.setItem('userDocuments', JSON.stringify(updatedDocs));
    }
  };

  const handleDownload = (doc) => {
    // Simulate download
    alert(`Downloading ${doc.fileName}...\n(In a real app, this would download the actual file)`);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.status === filter;
    const matchesSearch = doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    rejected: documents.filter(d => d.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin"></i> Loading documents...
      </div>
    );
  }

  return (
    <div className="view-wrapper">
      <div className="view-container">
        {/* Header */}
        <div className="view-header">
          <Link to="/dashboard" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
          <h1>My Documents</h1>
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item verified">
            <span className="stat-number">{stats.verified}</span>
            <span className="stat-label">Verified</span>
          </div>
          <div className="stat-item pending">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-item rejected">
            <span className="stat-number">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'verified' ? 'active' : ''}`}
              onClick={() => setFilter('verified')}
            >
              Verified
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button 
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
          </div>
          
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h3>No documents found</h3>
            <p>Upload your first document to get started</p>
            <Link to="/upload" className="btn-primary">
              <i className="fas fa-cloud-upload-alt"></i> Upload Documents
            </Link>
          </div>
        ) : (
          <div className="documents-list">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-preview">
                  <div className="document-icon-large">
                    <i className={getDocumentIcon(doc.documentType)}></i>
                  </div>
                  <div className="document-details">
                    <h3>{doc.documentName}</h3>
                    <p className="document-meta">
                      <span><i className="fas fa-file"></i> {doc.fileName}</span>
                      <span><i className="fas fa-weight-hanging"></i> {doc.fileSize}</span>
                      <span><i className="fas fa-calendar"></i> {new Date(doc.uploadDate).toLocaleDateString()}</span>
                    </p>
                    {doc.status === 'rejected' && doc.rejectionReason && (
                      <p className="rejection-reason">
                        <i className="fas fa-exclamation-triangle"></i> {doc.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="document-actions">
                  {getStatusBadge(doc.status)}
                  <button onClick={() => handleDownload(doc)} className="action-btn" title="Download">
                    <i className="fas fa-download"></i>
                  </button>
                  <button onClick={() => handleUpdate(doc)} className="action-btn" title="Update">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(doc.id)} className="action-btn delete" title="Delete">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="view-actions">
          <Link to="/upload" className="btn-primary">
            <i className="fas fa-plus"></i> Upload New Document
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewDocuments;