import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, getDocumentHistory, logout } from '../utils/api';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, completion: 0 });
  const dropdownRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [docData, histData] = await Promise.all([
        getDocuments(),
        getDocumentHistory(user?.id).catch(() => ({ success: false }))
      ]);
      if (docData.success) {
        const docs = docData.documents || [];
        setDocuments(docs);
        const verified = docs.filter(d => d.status === 'verified').length;
        const pending = docs.filter(d => d.status === 'pending').length;
        const rejected = docs.filter(d => d.status === 'rejected').length;
        setStats({ pending, verified, rejected, completion: docs.length > 0 ? Math.round((verified / docs.length) * 100) : 0 });
      }
      if (histData.success) setHistory(histData.history || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); if (onLogout) onLogout(); window.location.href = '/candidate/login'; };

  const formatDate = (d) => {
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const actionColors = { UPLOADED: '#667eea', UPDATED: '#10b981', VERIFIED: '#059669', REJECTED: '#dc2626', DELETED: '#ef4444', VIEWED: '#8b5cf6' };
  const actionIcons = { UPLOADED: '📤', UPDATED: '🔄', VERIFIED: '✅', REJECTED: '❌', DELETED: '🗑️', VIEWED: '👁️' };

  const menuItems = [
    { icon: '📤', label: 'Upload Documents', sub: 'Add new documents', path: '/upload', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { icon: '📁', label: 'View Documents', sub: 'See all uploads', path: '/documents', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
    { icon: '📊', label: 'Verification Status', sub: 'Track your progress', path: '/verification-status', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
    { icon: '📋', label: 'My Reports', sub: 'Download BGV report', path: '/reports', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
  ];

  const statCards = [
    { label: 'Pending', value: stats.pending, icon: '⏳', bg: '#fef3c7', border: '#fde68a', color: '#d97706' },
    { label: 'Verified', value: stats.verified, icon: '✅', bg: '#d1fae5', border: '#a7f3d0', color: '#059669' },
    { label: 'Rejected', value: stats.rejected, icon: '❌', bg: '#fee2e2', border: '#fecaca', color: '#dc2626' },
    { label: 'Completion', value: `${stats.completion}%`, icon: '🎯', bg: '#ede9fe', border: '#ddd6fe', color: '#7c3aed' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui" }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Loading dashboard...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 'clamp(1rem,3vw,1.5rem)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .stat-c:hover{transform:translateY(-6px) scale(1.02)!important;box-shadow:0 20px 40px rgba(0,0,0,0.15)!important;}
        .menu-c:hover{transform:translateY(-8px)!important;box-shadow:0 24px 48px rgba(0,0,0,0.18)!important;}
        .menu-c:hover .arr{transform:translateX(6px)!important;opacity:1!important;}
        .menu-c:hover .mic{transform:scale(1.1)!important;}
        .hist-r:hover{background:#f0f4ff!important;transform:translateX(4px)!important;}
        .dd-i:hover{background:#f5f3ff!important;color:#667eea!important;}
        .nb:hover{box-shadow:0 0 0 2px #667eea33!important;}
        @media(max-width:900px){.sg{grid-template-columns:1fr 1fr!important;}.mg{grid-template-columns:1fr 1fr!important;}}
        @media(max-width:480px){.sg{grid-template-columns:1fr 1fr!important;}.mg{grid-template-columns:1fr!important;}}
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', animation: 'slideUp 0.45s ease' }}>

        {/* NAVBAR */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(0.75rem,2vw,1rem) clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(102,126,234,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(102,126,234,0.4)' }}>🛡️</div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.5px' }}>VeriFlow</span>
              <span style={{ fontSize: 11, color: '#9ca3af', display: 'block', lineHeight: 1.2 }}>BGV System</span>
            </div>
          </div>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)} className="nb" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', transition: 'all 0.2s', background: 'white' }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, boxShadow: '0 2px 8px rgba(102,126,234,0.4)' }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 13 }}>{user?.name || 'User'}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Candidate</p>
              </div>
              <span style={{ color: '#c4b5fd', fontSize: 10, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none', fontWeight: 700 }}>▼</span>
            </div>
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 18, minWidth: 240, padding: '8px 0', zIndex: 1000, boxShadow: '0 24px 56px rgba(102,126,234,0.18)', animation: 'slideUp 0.15s ease' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                  <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, marginBottom: 8 }}>{user?.name?.charAt(0).toUpperCase()}</div>
                  <p style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 13 }}>{user?.name}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{user?.email}</p>
                </div>
                {[
                  { label: '📁 My Documents', action: () => navigate('/documents') },
                  { label: '📊 Verification Status', action: () => navigate('/verification-status') },
                  { label: '📋 My Reports', action: () => navigate('/reports') },
                  { label: '🔑 Forgot Password', action: () => { window.location.href = '/candidate/forgot-password'; } },
                ].map((item, i) => (
                  <button key={i} className="dd-i" onClick={() => { item.action(); setDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: '#374151', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontWeight: 500 }}>{item.label}</button>
                ))}
                <div style={{ height: 1, background: '#f3f4f6', margin: '6px 12px' }}></div>
                <button className="dd-i" onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: '#dc2626', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontWeight: 500 }}>🚪 Logout</button>
              </div>
            )}
          </div>
        </div>

        {/* WELCOME */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 14 }}>Here's your background verification overview</p>
        </div>

        {/* STAT CARDS */}
        <div className="sg" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {statCards.map((s, i) => (
            <div key={i} className="stat-c" style={{ background: 'white', borderRadius: '1.25rem', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'default', borderTop: `3px solid ${s.border}` }}>
              <div style={{ width: 52, height: 52, background: s.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>{s.label}</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: s.color, margin: 0, lineHeight: 1, letterSpacing: '-1.5px' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '1.25rem', padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Verification Progress</span>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{stats.completion}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, height: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'white', borderRadius: 20, width: `${stats.completion}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 2px 10px rgba(255,255,255,0.5)' }}></div>
          </div>
          {stats.completion === 100 && (
            <p style={{ color: 'white', fontSize: 12, margin: '8px 0 0', fontWeight: 600 }}>🎉 All documents verified! HR can now generate your BGV report.</p>
          )}
        </div>

        {/* MENU CARDS */}
        <div className="mg" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {menuItems.map((item, i) => (
            <div key={i} className="menu-c" onClick={() => navigate(item.path)}
              style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative', overflow: 'hidden' }}>
              <div className="mic" style={{ width: 54, height: 54, background: item.gradient, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14, boxShadow: '0 6px 16px rgba(0,0,0,0.18)', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}>{item.icon}</div>
              <p style={{ color: '#1f2937', fontWeight: 700, margin: '0 0 4px', fontSize: 14 }}>{item.label}</p>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: 12 }}>{item.sub}</p>
              <span className="arr" style={{ position: 'absolute', top: 16, right: 18, color: '#667eea', fontSize: 20, opacity: 0, transition: 'all 0.3s' }}>→</span>
            </div>
          ))}
        </div>

        {/* HISTORY */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.875rem', borderBottom: '2px solid #f3f4f6' }}>
            <h3 style={{ color: '#1f2937', fontWeight: 700, fontSize: 15, margin: 0 }}>📅 Recent Activity</h3>
            <span style={{ fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '4px 12px', borderRadius: 20, fontWeight: 500 }}>{history.length} events</span>
          </div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No activity yet — upload your documents to get started</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.slice(0, 8).map((e, i) => (
                <div key={i} className="hist-r" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: '#fafafa', transition: 'all 0.2s ease', cursor: 'default', borderLeft: `3px solid ${actionColors[e.action] || '#e5e7eb'}` }}>
                  <div style={{ width: 36, height: 36, background: `${actionColors[e.action] || '#9ca3af'}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{actionIcons[e.action] || '📋'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1f2937', fontWeight: 600, margin: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.documentName}</p>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: 11 }}>{e.action} by {e.performedByRole}</p>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: 11, flexShrink: 0 }}>{formatDate(e.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;