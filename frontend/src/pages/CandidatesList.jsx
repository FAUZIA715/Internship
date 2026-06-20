import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

  const isApproved = (c) => ['aadhaar','pan','degree','employment'].every(k => c[`${k}Status`] === 'verified');
  const isRejected = (c) => ['aadhaar','pan','degree','employment'].some(k => c[`${k}Status`] === 'rejected');
  const isPending = (c) => !isApproved(c) && !isRejected(c);

  const getStatus = (c) => {
    if (isApproved(c)) return { label: 'Approved', color: '#16a34a', bg: '#dcfce7' };
    if (isRejected(c)) return { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' };
    return { label: 'Pending', color: '#d97706', bg: '#fef3c7' };
  };

  const applyFilters = () => {
    let filtered = [...candidates];
    if (activeFilter === 'pending') filtered = filtered.filter(c => isPending(c));
    else if (activeFilter === 'approved') filtered = filtered.filter(c => isApproved(c));
    else if (activeFilter === 'rejected') filtered = filtered.filter(c => isRejected(c));
    if (searchTerm) {
      filtered = filtered.filter(c =>
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCandidates(filtered);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>
        ⏳ Loading candidates...
      </div>
    );
  }

  const filterBtns = [
    { key: 'all', label: `📋 All (${candidates.length})` },
    { key: 'pending', label: `⏳ Pending (${candidates.filter(isPending).length})` },
    { key: 'approved', label: `✅ Approved (${candidates.filter(isApproved).length})` },
    { key: 'rejected', label: `❌ Rejected (${candidates.filter(isRejected).length})` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <button onClick={() => navigate('/hr/dashboard')} style={{ background: '#f3f4f6', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>👥 All Candidates</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px' }}>
            <span>🔍</span>
            <input
              type="text" placeholder="Search by name or email..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, color: '#374151', width: 220 }}
            />
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {filterBtns.map(f => (
            <button key={f.key} onClick={() => { setActiveFilter(f.key); navigate(`/candidates-list?filter=${f.key}`); }}
              style={{ padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                background: activeFilter === f.key ? 'white' : 'rgba(255,255,255,0.15)',
                color: activeFilter === f.key ? '#1e3a5f' : 'white',
                boxShadow: activeFilter === f.key ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >{f.label}</button>
          ))}
        </div>

        {/* TABLE */}
        <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)' }}>
                {['👤 Name', '📧 Email', '💼 Position', '📊 Verification', '⚙️ Action'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 16px', textAlign: 'left', color: 'white', fontWeight: 600, fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: 15 }}>
                    No candidates found
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((c, i) => {
                  const status = getStatus(c);
                  return (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                            {c.name?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.email}</td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.position || 'N/A'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => navigate(`/candidate-details/${c._id}`)}
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white', border: 'none', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
                          👁️ View Details →
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default CandidatesList;