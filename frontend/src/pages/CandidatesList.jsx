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
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    const dept = params.get('department');
    if (filter) setActiveFilter(filter);
    if (dept) setDepartmentFilter(dept);
  }, [location.search]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, searchTerm, activeFilter, departmentFilter]);

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
    
    if (departmentFilter) {
      if (departmentFilter === 'Engineering') {
        filtered = filtered.filter(c => c.positionApplied?.includes('Developer') || c.positionApplied?.includes('Engineer'));
      } else if (departmentFilter === 'Product') {
        filtered = filtered.filter(c => c.positionApplied?.includes('Product'));
      } else if (departmentFilter === 'Design') {
        filtered = filtered.filter(c => c.positionApplied?.includes('UI') || c.positionApplied?.includes('UX'));
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCandidates(filtered);
  };

  const getAutoVerificationStatus = (candidate) => {
    const auto = candidate.autoVerification;
    if (!auto) return <span className="status-progress">⏳ In Progress</span>;
    const allVerified = auto.aadhaar === 'Verified' && auto.pan === 'Verified' && 
                        auto.degree === 'Verified' && auto.employment === 'Verified' && 
                        auto.address === 'Verified';
    if (allVerified) return <span className="status-completed">✅ Completed</span>;
    return <span className="status-progress">⏳ In Progress</span>;
  };

  const getHrStatusBadge = (status) => {
    if (status === 'Approved') return <span className="status-approved">✅ Approved</span>;
    if (status === 'Rejected') return <span className="status-rejected">❌ Rejected</span>;
    return <span className="status-pending">⏳ Pending</span>;
  };

  if (loading) return <div className="loading-container">Loading...</div>;

  return (
    <div className="candidates-list-container">
      <div className="list-header">
        <button className="back-btn" onClick={() => navigate('/hr-dashboard')}>← Back to Dashboard</button>
        <h1>All Candidates</h1>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="filter-buttons">
        <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => { setActiveFilter('all'); navigate('/candidates-list?filter=all'); }}>
          <i className="fas fa-list"></i> All ({candidates.length})
        </button>
        <button className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`} onClick={() => { setActiveFilter('pending'); navigate('/candidates-list?filter=pending'); }}>
          <i className="fas fa-clock"></i> Pending ({candidates.filter(c => c.hrReviewStatus === 'Pending').length})
        </button>
        <button className={`filter-btn ${activeFilter === 'approved' ? 'active' : ''}`} onClick={() => { setActiveFilter('approved'); navigate('/candidates-list?filter=approved'); }}>
          <i className="fas fa-check-circle"></i> Approved ({candidates.filter(c => c.hrReviewStatus === 'Approved').length})
        </button>
        <button className={`filter-btn ${activeFilter === 'rejected' ? 'active' : ''}`} onClick={() => { setActiveFilter('rejected'); navigate('/candidates-list?filter=rejected'); }}>
          <i className="fas fa-times-circle"></i> Rejected ({candidates.filter(c => c.hrReviewStatus === 'Rejected').length})
        </button>
      </div>

      <div className="table-wrapper">
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Position</th>
              <th>Verification Status</th>
              <th>HR Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(c => (
              <tr key={c._id}>
                <td><strong>{c.fullName}</strong></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.positionApplied}</td>
                <td>{getAutoVerificationStatus(c)}</td>
                <td>{getHrStatusBadge(c.hrReviewStatus)}</td>
                <td className="action-cell">
                  <button className="view-details-btn" onClick={() => navigate(`/candidate-details/${c._id}`)}>
                    View Details →
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

export default CandidatesList;