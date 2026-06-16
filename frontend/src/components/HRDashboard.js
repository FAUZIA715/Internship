import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCandidates, getCandidateDetails, downloadDocument, verifyDocument, logout } from '../services/api';

const HRDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDocs, setCandidateDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ ...message, visible: false }), 3000);
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getAllCandidates();
      if (data.success) setCandidates(data.candidates || []);
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCandidate = async (candidate) => {
    setSelectedCandidate(candidate);
    try {
      const data = await getCandidateDetails(candidate._id);
      if (data.success) {
        setCandidateDocs(data.documents || []);
      }
    } catch (error) {
      showMessage(error.message);
    }
  };

  const handleVerifyDocument = async (doc, status) => {
    try {
      await verifyDocument(doc.documentId || doc._id, status);
      showMessage(`Document marked as ${status}`, false);
      await fetchCandidates();
      if (selectedCandidate) {
        const data = await getCandidateDetails(selectedCandidate._id);
        if (data.success) setCandidateDocs(data.documents || []);
      }
    } catch (error) {
      showMessage(error.message);
    }
  };

  const handleDownload = async (doc) => {
    try {
      await downloadDocument(doc.documentId || doc._id);
    } catch (error) {
      showMessage('Download failed');
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const classes = {
      verified: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      not_uploaded: 'bg-gray-100 text-gray-500'
    };
    return <span className={`px-2 py-1 rounded-full text-xs ${classes[status] || classes.pending}`}>{status || 'not_uploaded'}</span>;
  };

  if (loading) {
    return <div className="loading-container"><i className="fas fa-spinner fa-spin"></i> Loading...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="logo-area">
            <div className="logo-icon-small"><i className="fas fa-shield-alt"></i></div>
            <span className="logo-text">VeriFlow - HR Dashboard</span>
          </div>
          <div className="user-area">
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <div><p className="user-name">{user?.name || 'HR User'}</p><p className="user-role">HR</p></div>
            </div>
            <button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>

        {message.visible && <div className={`message ${message.isError ? 'error' : 'success'} mb-4`}>{message.text}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <h2 className="text-xl font-bold mb-4">Candidates</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {candidates.map(candidate => (
                <div 
                  key={candidate._id} 
                  onClick={() => handleSelectCandidate(candidate)} 
                  className={`p-3 rounded-lg cursor-pointer transition ${selectedCandidate?._id === candidate._id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-gray-200'} border`}
                >
                  <p className="font-semibold">{candidate.name}</p>
                  <p className="text-sm text-gray-500">{candidate.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${candidate.overallStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {candidate.overallStatus === 'verified' ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {candidates.length === 0 && <p className="text-gray-500 text-center">No candidates found</p>}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow">
            {selectedCandidate ? (
              <>
                <h2 className="text-xl font-bold mb-2">{selectedCandidate.name}</h2>
                <p className="text-gray-500 mb-4">{selectedCandidate.email}</p>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {['aadhaar', 'pan', 'degree', 'employment', 'address'].map(type => (
                    <div key={type} className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs capitalize">{type}</p>
                      {getStatusBadge(selectedCandidate.documents?.[type] || 'not_uploaded')}
                    </div>
                  ))}
                </div>

                <h3 className="font-semibold mb-3">Uploaded Documents</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {candidateDocs.map(doc => (
                    <div key={doc._id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="font-semibold capitalize">{doc.documentType}</h3>
                          <p className="text-sm text-gray-500">{doc.fileName}</p>
                          <p className="text-xs text-gray-400">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(doc.status)}
                          <button onClick={() => handleDownload(doc)} className="text-blue-600 hover:text-blue-800" title="Download"><i className="fas fa-download"></i></button>
                        </div>
                      </div>
                      {['degree', 'employment', 'address'].includes(doc.documentType) && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => handleVerifyDocument(doc, 'verified')} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">✓ Verify</button>
                          <button onClick={() => handleVerifyDocument(doc, 'rejected')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">✗ Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {candidateDocs.length === 0 && <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <i className="fas fa-users text-4xl mb-3"></i>
                <p>Select a candidate to view their documents</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;