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

  useEffect(() => { fetchCandidates(); }, []);
  useEffect(() => { applyFilters(); }, [candidates, searchTerm, activeFilter]);

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hr/candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];
    
    // Apply status filter
    if (activeFilter === 'pending') {
      filtered = filtered.filter(c => candidateIsPending(c));
    } else if (activeFilter === 'approved') {
      filtered = filtered.filter(c => candidateIsApproved(c));
    } else if (activeFilter === 'rejected') {
      filtered = filtered.filter(c => candidateIsRejected(c));
    }
    // 'all' - no status filter needed
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCandidates(filtered);
  };

  const getVerificationStatus = (candidate) => {
    const allAutoVerified = 
      candidate.documents?.aadhaar?.status === 'verified' &&
      candidate.documents?.pan?.status === 'verified' &&
      candidate.documents?.degree?.status === 'verified' &&
      candidate.documents?.employment?.status === 'verified';

    const anyRejected = 
      candidate.documents?.aadhaar?.status === 'rejected' ||
      candidate.documents?.pan?.status === 'rejected' ||
      candidate.documents?.degree?.status === 'rejected' ||
      candidate.documents?.employment?.status === 'rejected';

    if (allAutoVerified) return <span className="status-completed">✅ Completed</span>;
    else if (anyRejected) return <span className="status-rejected">❌ Rejected</span>;
    return <span className="status-progress">⏳ In Progress</span>;
  };

  const getHrStatusBadge = (status) => {
    if (status === 'Approved') return <span className="status-approved">✅ Approved</span>;
    if (status === 'Rejected') return <span className="status-rejected">❌ Rejected</span>;
    return <span className="status-pending">⏳ Pending</span>;
  };

  // ✅ FIXED: Candidate is Approved when ALL documents are verified
  const candidateIsApproved = (candidate) => {
    const docs = [
      candidate.documents?.aadhaar?.status,
      candidate.documents?.pan?.status,
      candidate.documents?.degree?.status,
      candidate.documents?.employment?.status
    ];
    // If any document is undefined or not 'verified', candidate is NOT approved
    if (docs.some(s => s === undefined || s === 'pending' || s === 'rejected')) {
      return false;
    }
    return docs.every(s => s === 'verified');
  };

  // ✅ FIXED: Candidate is Rejected when ANY document is rejected
  const candidateIsRejected = (candidate) => {
    const docs = [
      candidate.documents?.aadhaar?.status,
      candidate.documents?.pan?.status,
      candidate.documents?.degree?.status,
      candidate.documents?.employment?.status
    ];
    // Check if any document exists and is rejected
    return docs.some(s => s === 'rejected');
  };

  // ✅ FIXED: Candidate is Pending when NOT all verified AND NOT rejected
  const candidateIsPending = (candidate) => {
    const docs = [
      candidate.documents?.aadhaar?.status,
      candidate.documents?.pan?.status,
      candidate.documents?.degree?.status,
      candidate.documents?.employment?.status
    ];
    
    // If any document is undefined (not uploaded), it's pending
    if (docs.some(s => s === undefined)) return true;
    
    // If any document is rejected, it's NOT pending (it's rejected)
    if (docs.some(s => s === 'rejected')) return false;
    
    // If ALL documents are verified, it's NOT pending (it's approved)
    if (docs.every(s => s === 'verified')) return false;
    
    // Otherwise, it's pending (some are 'pending')
    return docs.some(s => s === 'pending');
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
          ⏳ Pending ({candidates.filter(c => candidateIsPending(c)).length})
        </button>
        <button className={`filter-btn ${activeFilter === 'approved' ? 'active' : ''}`} onClick={() => { setActiveFilter('approved'); navigate('/candidates-list?filter=approved'); }}>
          ✅ Approved ({candidates.filter(c => candidateIsApproved(c)).length})
        </button>
        <button className={`filter-btn ${activeFilter === 'rejected' ? 'active' : ''}`} onClick={() => { setActiveFilter('rejected'); navigate('/candidates-list?filter=rejected'); }}>
          ❌ Rejected ({candidates.filter(c => candidateIsRejected(c)).length})
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
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                  No candidates found for this filter
                </td>
              </tr>
            ) : (
              filteredCandidates.map(c => (
                <tr key={c._id}>
                  <td><strong>👤 {c.name}</strong></td>
                  <td> {c.email}</td>
                  <td> {c.phone || generateRandomPhone()}</td>
                  <td> {c.position || 'N/A'}</td>
                  <td>{getVerificationStatus(c)}</td>
                  <td>
                    {candidateIsApproved(c) && <span className="status-approved">✅ Approved</span>}
                    {candidateIsRejected(c) && <span className="status-rejected">❌ Rejected</span>}
                    {candidateIsPending(c) && <span className="status-pending">⏳ Pending</span>}
                  </td>
                  <td className="action-cell">
                    <button className="view-details-btn" onClick={() => navigate(`/candidate-details/${c._id}`)}>
                      👁️ View Details →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const generateRandomPhone = () => {
  const firstDigit = Math.floor(Math.random() * 3) + 7; // 7, 8, or 9
  let phone = firstDigit.toString();
  for (let i = 0; i < 9; i++) {
    phone += Math.floor(Math.random() * 10).toString();
  }
  return phone;
};


export default CandidatesList;