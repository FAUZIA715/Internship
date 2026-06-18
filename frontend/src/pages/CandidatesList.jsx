import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CandidatesList.css';

const CandidatesList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    if (filter) setActiveFilter(filter);
  }, [location.search]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, activeFilter]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hr/candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => c.hrReviewStatus?.toLowerCase() === activeFilter.toLowerCase());
    }
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCandidates(filtered);
  };

  const getVerificationStatus = (candidate) => {
    const allAutoVerified = 
      candidate.autoVerification?.aadhaar === 'Verified' &&
      candidate.autoVerification?.pan === 'Verified' &&
      candidate.autoVerification?.address === 'Verified';
    
    if (allAutoVerified) return <span className="status-completed">✅ Completed</span>;
    return <span className="status-progress">⏳ In Progress</span>;
  };

  const getHrStatusBadge = (status) => {
    if (status === 'Approved') return <span className="status-approved">✅ Approved</span>;
    if (status === 'Rejected') return <span className="status-rejected">❌ Rejected</span>;
    return <span className="status-pending">⏳ Pending</span>;
  };

  if (loading) return <div className="loading-container">⏳ Loading candidates...</div>;

  return (
    <div className="candidates-list-container">
      <div className="list-header">
        <button className="back-btn" onClick={() => navigate('/hr-dashboard')}>← Back to Dashboard</button>
        <h1>👥 All Candidates</h1>
        <div className="search-box">
          🔍
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="filter-buttons">
        <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => { setActiveFilter('all'); navigate('/candidates-list?filter=all'); }}>
          📋 All ({candidates.length})
        </button>
        <button className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => { setActiveFilter('pending'); navigate('/candidates-list?filter=pending'); }}>
          ⏳ Pending ({candidates.filter(c => c.hrReviewStatus === 'Pending').length})
        </button>
        <button className={`filter-btn ${activeFilter === 'approved' ? 'active' : ''}`} onClick={() => { setActiveFilter('approved'); navigate('/candidates-list?filter=approved'); }}>
          ✅ Approved ({candidates.filter(c => c.hrReviewStatus === 'Approved').length})
        </button>
        <button className={`filter-btn ${activeFilter === 'rejected' ? 'active' : ''}`} onClick={() => { setActiveFilter('rejected'); navigate('/candidates-list?filter=rejected'); }}>
          ❌ Rejected ({candidates.filter(c => c.hrReviewStatus === 'Rejected').length})
        </button>
      </div>

      <div className="table-wrapper">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>👤 Name</th>
              <th>📧 Email</th>
              <th>📞 Phone</th>
              <th>💼 Position</th>
              <th>📊 Verification Status</th>
              <th>🏁 HR Status</th>
              <th>⚙️ Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(c => (
              <tr key={c._id}>
                <td><strong>👤 {c.fullName}</strong></td>
                <td>📧 {c.email}</td>
                <td>📞 {c.phone}</td>
                <td>💼 {c.positionApplied}</td>
                <td>{getVerificationStatus(c)}</td>
                <td>{getHrStatusBadge(c.hrReviewStatus)}</td>
                <td className="action-cell">
                  <button className="view-details-btn" onClick={() => navigate(`/candidate-details/${c._id}`)}>
                    👁️ View Details →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// ─── GET HR STATUS ────────────────────────────────────────────────
const getHrStatus = (candidate) => {
  const docs = [
    candidate.aadhaarStatus,
    candidate.panStatus,
    candidate.addressStatus,
    candidate.degreeStatus,
    candidate.employmentStatus
  ];
  
  if (docs.every(s => s === 'verified')) return 'Approved';
  if (docs.some(s => s === 'rejected')) return 'Rejected';
  return 'Pending';
};

// ─── GET HR STATUS BADGE ─────────────────────────────────────────
const getHrStatusBadge = (candidate) => {
  const status = getHrStatus(candidate);
  if (status === 'Approved') return <span className="status-approved">✅ Approved</span>;
  if (status === 'Rejected') return <span className="status-rejected">❌ Rejected</span>;
  return <span className="status-pending">⏳ Pending</span>;
};
export default CandidatesList;