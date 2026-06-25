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
      const res = await fetch('http://localhost:5000/api/hr/candidates', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch { setCandidates([]); }
    finally { setLoading(false); }
  };

  const isApproved = (c) => ['aadhaar','pan','degree','employment'].every(k => c[`${k}Status`] === 'verified');
  const isRejected = (c) => ['aadhaar','pan','degree','employment'].some(k => c[`${k}Status`] === 'rejected');
  const isPending = (c) => !isApproved(c) && !isRejected(c);

  const getStatus = (c) => {
    if (isApproved(c)) return { label: 'Approved', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' };
    if (isRejected(c)) return { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' };
    return { label: 'Pending', color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
  };

  const applyFilters = () => {
    let filtered = [...candidates];
    if (activeFilter === 'pending') filtered = filtered.filter(c => isPending(c));
    else if (activeFilter === 'approved') filtered = filtered.filter(c => isApproved(c));
    else if (activeFilter === 'rejected') filtered = filtered.filter(c => isRejected(c));
    if (searchTerm) filtered = filtered.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredCandidates(filtered);
  };

  const filterBtns = [
    { key: 'all', label: `📋 All (${candidates.length})` },
    { key: 'pending', label: `⏳ Pending (${candidates.filter(isPending).length})` },
    { key: 'approved', label: `✅ Approved (${candidates.filter(isApproved).length})` },
    { key: 'rejected', label: `❌ Rejected (${candidates.filter(isRejected).length})` },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui" }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 'clamp(1rem,3vw,1.5rem)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .tr:hover{background:#f5f3ff!important;}
        .vb:hover{background:linear-gradient(135deg,#667eea,#764ba2)!important;color:white!important;transform:scale(1.04)!important;}
        .back:hover{background:linear-gradient(135deg,#667eea,#764ba2)!important;color:white!important;}
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'slideUp 0.45s ease' }}>

        {/* HEADER */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(102,126,234,0.2)', flexWrap: 'wrap', gap: 12 }}>
          <button className="back" onClick={() => navigate('/hr/dashboard')} style={{ padding: '8px 18px', background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#667eea', transition: 'all 0.2s' }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', margin: 0 }}>👥 All Candidates</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 10, padding: '8px 14px' }}>
            <span>🔍</span>
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, color: '#374151', width: 200 }} />
          </div>
        </div>

        {/* FILTER BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {filterBtns.map(f => (
            <button key={f.key} onClick={() => { setActiveFilter(f.key); navigate(`/candidates-list?filter=${f.key}`); }}
              style={{ padding: '8px 20px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                background: activeFilter === f.key ? 'white' : 'rgba(255,255,255,0.2)',
                color: activeFilter === f.key ? '#667eea' : 'white',
                boxShadow: activeFilter === f.key ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                transform: activeFilter === f.key ? 'scale(1.05)' : 'scale(1)',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                {['👤 Name', '📧 Email', '💼 Position', '📊 Status', '⚙️ Action'].map((h, i) => (
                  <th key={i} style={{ padding: '14px 16px', textAlign: 'left', color: 'white', fontWeight: 700, fontSize: 13 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', fontSize: 15 }}>No candidates found</td></tr>
              ) : (
                filteredCandidates.map((c, i) => {
                  const st = getStatus(c);
                  return (
                    <tr key={c._id} className="tr" style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{c.name?.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 700, color: '#1f2937', fontSize: 14 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.email}</td>
                      <td style={{ padding: '14px 16px', color: '#6b7280', fontSize: 13 }}>{c.position || 'N/A'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button className="vb" onClick={() => navigate(`/candidate-details/${c._id}`)}
                          style={{ background: '#f5f3ff', border: '1.5px solid #c4b5fd', color: '#667eea', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 12, transition: 'all 0.2s' }}>
                          👁️ View →
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