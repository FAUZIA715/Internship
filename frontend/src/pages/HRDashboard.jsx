import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../utils/api';

const HRDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, departments: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hr/candidates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!Array.isArray(data)) return;
      setCandidates(data);

      const total = data.length;
      const allVerified = (c) => c.aadhaarStatus === 'verified' && c.panStatus === 'verified' && c.degreeStatus === 'verified' && c.employmentStatus === 'verified';
      const anyRejected = (c) => c.aadhaarStatus === 'rejected' || c.panStatus === 'rejected' || c.degreeStatus === 'rejected' || c.employmentStatus === 'rejected';
      const approved = data.filter(c => allVerified(c)).length;
      const rejected = data.filter(c => anyRejected(c)).length;
      const pending = total - approved - rejected;

      const departments = [
        { name: 'Engineering', icon: '⚙️', count: data.filter(c => c.position?.toLowerCase().includes('engineer') || c.position?.toLowerCase().includes('developer')).length },
        { name: 'Product', icon: '📦', count: data.filter(c => c.position?.toLowerCase().includes('product')).length },
        { name: 'Design', icon: '🎨', count: data.filter(c => c.position?.toLowerCase().includes('design')).length },
        { name: 'Sales', icon: '💼', count: data.filter(c => c.position?.toLowerCase().includes('sales')).length },
        { name: 'Marketing', icon: '📣', count: data.filter(c => c.position?.toLowerCase().includes('marketing')).length },
      ];

      setStats({ total, pending, approved, rejected, departments });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    if (onLogout) onLogout();
    window.location.href = '/hr/login';
  };

  const getStatus = (c) => {
    const allDone = c.aadhaarStatus === 'verified' && c.panStatus === 'verified' && c.degreeStatus === 'verified' && c.employmentStatus === 'verified';
    const anyRej = c.aadhaarStatus === 'rejected' || c.panStatus === 'rejected' || c.degreeStatus === 'rejected' || c.employmentStatus === 'rejected';
    if (allDone) return { label: 'Approved', color: '#16a34a', bg: '#dcfce7' };
    if (anyRej) return { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' };
    return { label: 'Pending', color: '#d97706', bg: '#fef3c7' };
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: 48, height: 48, border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Loading Dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Candidates', value: stats.total, icon: '👥', bg: '#dbeafe', filter: 'all' },
    { label: 'Pending Review', value: stats.pending, icon: '⏳', bg: '#fef3c7', filter: 'pending' },
    { label: 'Approved', value: stats.approved, icon: '✅', bg: '#dcfce7', filter: 'approved' },
    { label: 'Rejected', value: stats.rejected, icon: '❌', bg: '#fee2e2', filter: 'rejected' },
  ];

  const S = {
    wrap: { minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" },
    container: { maxWidth: 1200, margin: '0 auto' },
    navbar: { background: 'white', borderRadius: '1.5rem', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '2rem' },
    card: { background: 'white', borderRadius: '1.5rem', padding: '1.5rem 2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '2rem' },
    sectionTitle: { fontSize: 18, fontWeight: 600, color: '#1e293b', margin: '0 0 1rem' },
  };

  return (
    <div style={S.wrap}>
      <div style={S.container}>

        {/* NAVBAR */}
        <div style={S.navbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1f2937' }}>VeriFlow</span>
              <span style={{ color: '#d1d5db', margin: '0 8px' }}>|</span>
              <span style={{ fontSize: 16, fontWeight: 500, color: '#6b7280' }}>HR Workspace</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: '#f8fafc', borderRadius: 50 }}>
              <span style={{ fontSize: 28 }}>👤</span>
              <div>
                <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: 14 }}>{user?.name || 'HR Administrator'}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Verification Manager</p>
              </div>
            </div>
            <button onClick={handleLogout} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              🚪 Logout
            </button>
          </div>
        </div>

        {/* WELCOME */}
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>👋 Welcome back, {user?.name || 'HR Administrator'}!</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 15 }}>📊 Manage candidate verifications and track document status</p>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {statCards.map((s, i) => (
            <div key={i} onClick={() => navigate(`/candidates-list?filter=${s.filter}`)}
              style={{ background: 'white', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)'; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontSize: 32, fontWeight: 700, color: '#1e293b', margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* DEPARTMENTS */}
        <div style={S.card}>
          <h3 style={S.sectionTitle}>🏢 Departments</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
            {stats.departments.map((dept, i) => (
              <div key={i} onClick={() => navigate('/candidates-list?filter=all')}
                style={{ background: '#f8fafc', borderRadius: 12, padding: '0.75rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{dept.icon}</div>
                <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: 13 }}>{dept.name}</p>
                <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{dept.count} candidates</p>
              </div>
            ))}
            <div onClick={() => navigate('/candidates-list?filter=all')}
              style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: 12, padding: '0.75rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(59,130,246,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>👁️</div>
              <p style={{ fontWeight: 600, color: 'white', margin: 0, fontSize: 13 }}>View All</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>{stats.total} candidates</p>
            </div>
          </div>
        </div>

        {/* RECENT CANDIDATES */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ ...S.sectionTitle, margin: 0 }}>👤 Recent Candidates</h3>
            <button onClick={() => navigate('/candidates-list?filter=all')} style={{ background: 'none', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
              View All →
            </button>
          </div>
          {candidates.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem 0' }}>No candidates found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {candidates.slice(0, 5).map((c, i) => {
                const status = getStatus(c);
                return (
                  <div key={i} onClick={() => navigate(`/candidate-details/${c._id}`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f9fafb', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16 }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#1e293b', margin: 0, fontSize: 14 }}>{c.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{c.email} · {c.position || 'N/A'}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 12px', borderRadius: 20, background: status.bg, color: status.color }}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/candidates-list?filter=pending')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white', border: 'none', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: 14, boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
            ⏳ View Pending ({stats.pending})
          </button>
          <button onClick={() => navigate('/candidates-list?filter=all')} style={{ padding: '12px 28px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            👥 View All Candidates
          </button>
          <button onClick={() => navigate('/candidates-list?filter=approved')} style={{ padding: '12px 28px', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 50, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            ✅ View Approved ({stats.approved})
          </button>
        </div>

      </div>
    </div>
  );
};

export default HRDashboard;