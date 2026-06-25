import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/api';

const candidateIsApproved = (c) => {
  const docs = [c.documents?.aadhaar?.status, c.documents?.pan?.status, c.documents?.degree?.status, c.documents?.employment?.status];
  return docs.every(s => s === 'verified');
};
const candidateIsRejected = (c) => {
  const docs = [c.documents?.aadhaar?.status, c.documents?.pan?.status, c.documents?.degree?.status, c.documents?.employment?.status];
  return docs.some(s => s === 'rejected');
};
const candidateIsPending = (c) => !candidateIsApproved(c) && !candidateIsRejected(c);

const HRDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, departments: [] });
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/hr/candidates', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setCandidates(data);
      setStats({
        total: data.length,
        pending: data.filter(c => candidateIsPending(c)).length,
        approved: data.filter(c => candidateIsApproved(c)).length,
        rejected: data.filter(c => candidateIsRejected(c)).length,
        departments: [
          { name: 'Engineering', icon: '⚙️', count: data.filter(c => c.position?.toLowerCase().includes('engineer') || c.position?.toLowerCase().includes('developer')).length },
          { name: 'Product', icon: '📦', count: data.filter(c => c.position?.toLowerCase().includes('product')).length },
          { name: 'Design', icon: '🎨', count: data.filter(c => c.position?.toLowerCase().includes('design')).length },
          { name: 'Sales', icon: '💼', count: data.filter(c => c.position?.toLowerCase().includes('sales')).length },
          { name: 'Marketing', icon: '📣', count: data.filter(c => c.position?.toLowerCase().includes('marketing')).length },
        ]
      });
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleLogout = () => { clearSession(); if (onLogout) onLogout(); window.location.href = '/candidate/login'; };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui" }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>Loading Dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  const statCards = [
    { label: 'Total Candidates', value: stats.total, icon: '👥', bg: '#ede9fe', color: '#7c3aed', filter: 'all' },
    { label: 'Pending Review', value: stats.pending, icon: '⏳', bg: '#fef3c7', color: '#d97706', filter: 'pending' },
    { label: 'Approved', value: stats.approved, icon: '✅', bg: '#d1fae5', color: '#059669', filter: 'approved' },
    { label: 'Rejected', value: stats.rejected, icon: '❌', bg: '#fee2e2', color: '#dc2626', filter: 'rejected' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 'clamp(1rem,3vw,1.5rem)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .sc:hover{transform:translateY(-6px)!important;box-shadow:0 20px 40px rgba(0,0,0,0.15)!important;}
        .dc:hover{background:#f5f3ff!important;transform:translateX(4px)!important;}
        .dpt:hover{transform:translateY(-4px)!important;box-shadow:0 8px 24px rgba(102,126,234,0.2)!important;border-color:#a78bfa!important;}
        .ddi:hover{background:#f5f3ff!important;color:#667eea!important;}
        .nb:hover{box-shadow:0 0 0 2px #667eea44!important;}
        .ab:hover{transform:translateY(-2px)!important;box-shadow:0 8px 20px rgba(0,0,0,0.15)!important;}
        @media(max-width:900px){.sg{grid-template-columns:1fr 1fr!important;}.dg{grid-template-columns:repeat(3,1fr)!important;}}
        @media(max-width:480px){.sg{grid-template-columns:1fr 1fr!important;}.dg{grid-template-columns:1fr 1fr!important;}.ag{flex-direction:column!important;}}
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'slideUp 0.45s ease' }}>

        {/* NAVBAR */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(0.75rem,2vw,1rem) clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(102,126,234,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(102,126,234,0.4)' }}>🛡️</div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.5px' }}>VeriFlow</span>
              <span style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#6b7280' }}>HR Workspace</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div onClick={() => setDropdownOpen(!dropdownOpen)} className="nb" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', background: 'white', transition: 'all 0.2s' }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>{user?.name?.charAt(0).toUpperCase() || 'H'}</div>
                <div>
                  <p style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 13 }}>{user?.name || 'HR Administrator'}</p>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>HR Manager</p>
                </div>
                <span style={{ color: '#c4b5fd', fontSize: 10, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
              </div>
              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 18, minWidth: 220, padding: '8px 0', zIndex: 1000, boxShadow: '0 24px 56px rgba(102,126,234,0.18)', animation: 'slideUp 0.15s ease' }}>
                  {[
                    { label: '👥 All Candidates', action: () => navigate('/candidates-list?filter=all') },
                    { label: '⏳ Pending Review', action: () => navigate('/candidates-list?filter=pending') },
                    { label: '✅ Approved', action: () => navigate('/candidates-list?filter=approved') },
                  ].map((item, i) => (
                    <button key={i} className="ddi" onClick={() => { item.action(); setDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: '#374151', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontWeight: 500 }}>{item.label}</button>
                  ))}
                  <div style={{ height: 1, background: '#f3f4f6', margin: '6px 12px' }}></div>
                  <button className="ddi" onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: '#dc2626', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontWeight: 500 }}>🚪 Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* WELCOME */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            👋 Welcome back, {user?.name?.split(' ')[0] || 'HR Administrator'}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 14 }}>📊 Manage candidate verifications and track document status</p>
        </div>

        {/* STAT CARDS */}
        <div className="sg" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {statCards.map((s, i) => (
            <div key={i} className="sc" onClick={() => navigate(`/candidates-list?filter=${s.filter}`)}
              style={{ background: 'white', borderRadius: '1.25rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer' }}>
              <div style={{ width: 54, height: 54, background: s.bg, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: s.color, margin: 0, lineHeight: 1, letterSpacing: '-1.5px' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DEPARTMENTS */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1f2937', fontWeight: 700, fontSize: 16, margin: '0 0 1rem' }}>🏢 Departments</h3>
          <div className="dg" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
            {stats.departments.map((d, i) => (
              <div key={i} className="dpt" onClick={() => navigate('/candidates-list?filter=all')}
                style={{ background: '#fafafa', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{d.icon}</div>
                <p style={{ fontWeight: 700, color: '#1f2937', margin: '0 0 2px', fontSize: 12 }}>{d.name}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{d.count} candidates</p>
              </div>
            ))}
            <div className="dpt" onClick={() => navigate('/candidates-list?filter=all')}
              style={{ background: 'linear-gradient(135deg, #667eea15, #764ba215)', border: '1.5px solid #c4b5fd', borderRadius: 14, padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>👁️</div>
              <p style={{ fontWeight: 700, color: '#667eea', margin: '0 0 2px', fontSize: 12 }}>View All</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{stats.total} total</p>
            </div>
          </div>
        </div>

        {/* RECENT CANDIDATES */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.875rem', borderBottom: '2px solid #f3f4f6' }}>
            <h3 style={{ color: '#1f2937', fontWeight: 700, fontSize: 16, margin: 0 }}>👤 Recent Candidates</h3>
            <button onClick={() => navigate('/candidates-list?filter=all')} style={{ padding: '6px 16px', background: 'white', border: '1.5px solid #c4b5fd', borderRadius: 10, color: '#667eea', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#667eea,#764ba2)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#667eea'; }}>
              View All →
            </button>
          </div>
          {candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
              <p style={{ margin: 0 }}>No candidates yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {candidates.slice(0, 5).map((c, i) => {
                const approved = candidateIsApproved(c);
                const rejected = candidateIsRejected(c);
                const st = approved ? { label: 'Approved', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' } : rejected ? { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' } : { label: 'Pending', color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
                return (
                  <div key={i} className="dc" onClick={() => navigate(`/candidate-details/${c._id}`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fafafa', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', borderLeft: '3px solid #e5e7eb', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{c.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 13 }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{c.email} · {c.position || 'N/A'}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="ag" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: `⏳ View Pending (${stats.pending})`, filter: 'pending', primary: true },
            { label: '👥 View All Candidates', filter: 'all', primary: false },
            { label: `✅ View Approved (${stats.approved})`, filter: 'approved', primary: false },
          ].map((btn, i) => (
            <button key={i} className="ab" onClick={() => navigate(`/candidates-list?filter=${btn.filter}`)}
              style={{ padding: '12px 28px', background: btn.primary ? 'white' : 'rgba(255,255,255,0.15)', color: btn.primary ? '#667eea' : 'white', border: btn.primary ? 'none' : '2px solid rgba(255,255,255,0.4)', borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: btn.primary ? '0 4px 16px rgba(0,0,0,0.1)' : 'none' }}>
              {btn.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HRDashboard;