import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AllCandidates.css';

const AllCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCandidates();
  }, []);

  const fetchAllCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
        setFilteredCandidates(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const verified = data.filter(c => c.overallStatus === 'Verified').length;
    const pending = data.filter(c => c.overallStatus === 'Pending').length;
    setStats({ total, verified, pending });
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = candidates.filter(candidate =>
      candidate.fullName.toLowerCase().includes(term) ||
      candidate.email.toLowerCase().includes(term)
    );
    setFilteredCandidates(filtered);
  };

  const handleDelete = async (email, fullName) => {
    if (!window.confirm(`Are you sure you want to delete "${fullName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/candidates/${email}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchAllCandidates();
        setDeleteConfirm({ email, fullName });
        setTimeout(() => setDeleteConfirm(null), 3000);
      } else {
        alert('Failed to delete candidate');
      }
    } catch (error) {
      alert('Error deleting candidate');
    }
  };

  const handleViewProfile = (email) => {
    navigate(`/profile/${email}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Verified': return 'status-verified';
      case 'Pending': return 'status-pending';
      case 'Rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <div className="loading-container">Loading candidates...</div>;
  }

  return (
    <div className="all-candidates-container">
      {/* Admin Badge */}
      <div className="admin-badge">
        <span className="admin-icon">👑</span>
        <span>Admin Portal | All Candidates</span>
      </div>

      {deleteConfirm && (
        <div className="success-toast">
          ✅ {deleteConfirm.fullName} has been deleted successfully!
        </div>
      )}

      <div className="all-candidates-card">
        <h2>🎯 Candidate Management Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Candidates</div>
          </div>
          <div className="stat-card verified">
            <div className="stat-number">{stats.verified}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => {
                setSearchTerm('');
                setFilteredCandidates(candidates);
              }}>✕</button>
            )}
          </div>
          <button className="refresh-btn" onClick={fetchAllCandidates}>
            🔄 Refresh
          </button>
        </div>
        
        {filteredCandidates.length === 0 && (
          <div className="no-candidates">
            <p>📭 No candidates found</p>
            <button className="register-nav-btn" onClick={() => navigate('/register')}>
              + Register First Candidate
            </button>
          </div>
        )}
        
        {filteredCandidates.length > 0 && (
          <>
            <div className="table-header-info">
              <span>Showing {filteredCandidates.length} of {candidates.length} candidates</span>
            </div>
            
            {/* Table with wrapper for horizontal scroll */}
            <div className="candidates-table-wrapper">
              <table className="candidates-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Registered On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate, index) => (
                    <tr key={candidate._id}>
                      <td>{index + 1}</td>
                      <td className="candidate-name">{candidate.fullName}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.phone}</td>
                      <td>{candidate.positionApplied}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(candidate.overallStatus)}`}>
                          {candidate.overallStatus}
                        </span>
                      </td>
                      <td>{formatDate(candidate.createdAt)}</td>
                      <td className="actions-cell">
                        <button 
  className="view-btn"
  onClick={() => navigate(`/profile/${candidate.email}`, { state: { from: 'candidates' } })}
>
  👁️ View
</button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(candidate.email, candidate.fullName)}
                          title="Delete Candidate"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        
<div className="bottom-actions">
  <button className="back-btn" onClick={() => navigate('/dashboard')}>
    ← Back to Dashboard
  </button>
</div>
      </div>
    </div>
  );
};

export default AllCandidates;