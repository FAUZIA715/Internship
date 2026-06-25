import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports, downloadReport, logout } from '../utils/api';

const CandidateReports = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { fetchReports(); }, []);
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      if (data.success) setReports(data.reports || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); if (onLogout) onLogout(); window.location.href = '/candidate/login'; };

  const handleDownload = async (reportId) => {
    try { setDownloading(true); await downloadReport(reportId); }
    catch (e) { alert('Download failed: ' + e.message); }
    finally { setDownloading(false); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const getDecisionStyle = (d) => {
    if (d === 'Clear') return { bg: '#d1fae5', color: '#059669', border: '#a7f3d0', icon: '✅' };
    if (d === 'Not Clear') return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', icon: '❌' };
    return { bg: '#fef3c7', color: '#d97706', border: '#fde68a', icon: '⏳' };
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui" }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Loading reports...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 'clamp(1rem,3vw,1.5rem)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .rc:hover{transform:translateY(-4px)!important;box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
        .dl-btn:hover{transform:scale(1.04)!important;box-shadow:0 8px 24px rgba(102,126,234,0.4)!important;}
        .ddi:hover{background:#f5f3ff!important;color:#667eea!important;}
        .nb:hover{box-shadow:0 0 0 2px #667eea44!important;}
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', animation: 'slideUp 0.45s ease' }}>

        {/* NAVBAR */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(0.75rem,2vw,1rem) clamp(1rem,3vw,2rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(102,126,234,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 4px 12px rgba(102,126,234,0.4)' }}>🛡️</div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1f2937', letterSpacing: '-0.5px' }}>VeriFlow</span>
              <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>BGV System</span>
            </div>
          </div>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)} className="nb" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 14px', borderRadius: 14, border: '1.5px solid #e5e7eb', background: 'white', transition: 'all 0.2s' }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 13 }}>{user?.name}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Candidate</p>
              </div>
              <span style={{ color: '#c4b5fd', fontSize: 10, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
            </div>
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 18, minWidth: 220, padding: '8px 0', zIndex: 1000, boxShadow: '0 24px 56px rgba(102,126,234,0.18)', animation: 'slideUp 0.15s ease' }}>
                {[
                  { label: '🏠 Dashboard', action: () => navigate('/candidate/dashboard') },
                  { label: '📁 My Documents', action: () => navigate('/documents') },
                  { label: '📊 Verification Status', action: () => navigate('/verification-status') },
                  { label: '🚪 Logout', action: handleLogout, red: true },
                ].map((item, i) => (
                  <button key={i} className="ddi" onClick={() => { item.action(); setDropdownOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, color: item.red ? '#dc2626' : '#374151', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', fontWeight: 500 }}>{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* HEADER */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>📋 My Reports</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 14 }}>Download your background verification reports</p>
        </div>

        {reports.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '1.5rem', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #667eea15, #764ba215)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>📂</div>
            <h3 style={{ color: '#1f2937', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>No Reports Yet</h3>
            <p style={{ color: '#9ca3af', margin: '0 0 6px', fontSize: 14 }}>Your BGV report hasn't been generated yet.</p>
            <p style={{ color: '#d1d5db', margin: '0 0 24px', fontSize: 13 }}>Wait for HR to verify all documents first.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/verification-status')} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, boxShadow: '0 4px 12px rgba(102,126,234,0.3)', transition: 'all 0.2s' }}>Check Status</button>
              <button onClick={() => navigate('/documents')} style={{ padding: '10px 22px', background: 'white', color: '#667eea', border: '1.5px solid #c4b5fd', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}>View Documents</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reports.map((report) => {
              const decision = report.finalDecision || report.reportData?.finalDecision || 'Pending';
              const ds = getDecisionStyle(decision);
              return (
                <div key={report._id} className="rc" style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', display: 'flex', alignItems: 'center', gap: 'clamp(12px,3vw,24px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', flexWrap: 'wrap', borderLeft: `4px solid ${ds.border}` }}>
                  <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #dc262615, #ef444415)', border: '2px solid #fecaca', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>📄</div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h3 style={{ color: '#1f2937', fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>{report.reportName || 'BGV Report'}</h3>
                    <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 8px' }}>📅 {formatDate(report.generatedAt || report.createdAt)} · By {report.generatedByName || 'HR Manager'}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}>{ds.icon} Decision: {decision}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#d1fae5', color: '#059669', border: '1px solid #a7f3d0' }}>✅ Generated</span>
                    </div>
                  </div>
                  <button className="dl-btn" onClick={() => handleDownload(report._id)} disabled={downloading}
                    style={{ padding: '11px 22px', background: downloading ? '#e5e7eb' : 'linear-gradient(135deg, #667eea, #764ba2)', color: downloading ? '#9ca3af' : 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', fontSize: 14, whiteSpace: 'nowrap', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: downloading ? 'none' : '0 4px 12px rgba(102,126,234,0.3)', flexShrink: 0 }}>
                    {downloading ? '⏳ Downloading...' : '⬇️ Download PDF'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', marginTop: '2rem' }}>
          <p style={{ color: 'white', fontWeight: 700, margin: '0 0 6px', fontSize: 14 }}>ℹ️ About Your Reports</p>
          <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.8 }}>
            <li>Reports are generated only after all 4 documents are verified by HR</li>
            <li>Download as PDF anytime — valid for sharing with employers</li>
            <li>Decision shows <strong>Clear</strong> when all documents pass verification</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default CandidateReports;