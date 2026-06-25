import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, updateDocument, getDocumentHistory, logout } from '../utils/api';

const UpdateDocument = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [updatingDoc, setUpdatingDoc] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [message, setMessage] = useState({ text: '', isError: false });
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
      const [docData, histData] = await Promise.all([getDocuments(), getDocumentHistory(user?.id).catch(() => ({ success: false }))]);
      if (docData.success) setDocuments(docData.documents || []);
      if (histData.success) setHistory(histData.history || []);
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); if (onLogout) onLogout(); window.location.href = '/candidate/login'; };
  const showMsg = (text, isError = false) => { setMessage({ text, isError }); setTimeout(() => setMessage({ text: '', isError: false }), 4000); };

  const handleReUpload = async (docId) => {
    const file = selectedFiles[docId];
    if (!file) { showMsg('Please select a file first', true); return; }
    setUpdatingDoc(docId);
    try {
      const result = await updateDocument(docId, file);
      if (result.success) { showMsg('✅ Document updated successfully!'); setSelectedFiles(prev => { const n = {...prev}; delete n[docId]; return n; }); fetchAll(); }
      else showMsg(result.message, true);
    } catch (e) { showMsg(e.message || 'Update failed', true); }
    finally { setUpdatingDoc(null); }
  };

  const getStatusStyle = (status) => {
    const map = {
      verified: { bg: '#d1fae5', color: '#059669', border: '#a7f3d0', icon: '✅', label: 'Verified' },
      rejected: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', icon: '❌', label: 'Rejected' },
      pending: { bg: '#fef3c7', color: '#d97706', border: '#fde68a', icon: '⏳', label: 'Pending' },
    };
    return map[status] || map['pending'];
  };

  const docIcons = { aadhaar: '🪪', pan: '💳', degree: '🎓', employment: '💼', address: '🏠' };
  const requiredTypes = ['aadhaar', 'pan', 'degree', 'employment'];
  const completionPct = Math.round((documents.filter(d => requiredTypes.includes(d.documentType) && d.status === 'verified').length / 4) * 100);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  const actionColors = { UPLOADED: '#667eea', UPDATED: '#10b981', VERIFIED: '#059669', REJECTED: '#dc2626', DELETED: '#ef4444', VIEWED: '#8b5cf6' };
  const actionIcons = { UPLOADED: '📤', UPDATED: '🔄', VERIFIED: '✅', REJECTED: '❌', DELETED: '🗑️', VIEWED: '👁️' };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui" }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Loading...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 'clamp(1rem,3vw,1.5rem)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .doc-row:hover{background:#f0f4ff!important;transform:translateX(4px)!important;}
        .hi:hover{background:#f0f4ff!important;}
        .ddi:hover{background:#f5f3ff!important;color:#667eea!important;}
        .nb:hover{box-shadow:0 0 0 2px #667eea44!important;}
        .reup-btn:hover{transform:scale(1.04)!important;}
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
                <p style={{ fontWeight: 700, color: '#1f2937', margin: 0, fontSize: 13 }}>{user?.name || 'User'}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Candidate</p>
              </div>
              <span style={{ color: '#c4b5fd', fontSize: 10, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
            </div>
            {dropdownOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 18, minWidth: 220, padding: '8px 0', zIndex: 1000, boxShadow: '0 24px 56px rgba(102,126,234,0.18)', animation: 'slideUp 0.15s ease' }}>
                {[
                  { label: '🏠 Dashboard', action: () => navigate('/candidate/dashboard') },
                  { label: '📁 My Documents', action: () => navigate('/documents') },
                  { label: '📋 My Reports', action: () => navigate('/reports') },
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
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>📊 Verification Status</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 16px', fontSize: 14 }}>Track your document verification progress</p>
          <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '1rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Verification Progress</span>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>{completionPct}%</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, height: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'white', borderRadius: 20, width: `${completionPct}%`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 2px 10px rgba(255,255,255,0.5)' }}></div>
            </div>
            {completionPct === 100 && <p style={{ color: 'white', fontSize: 12, margin: '8px 0 0', fontWeight: 600 }}>🎉 All documents verified!</p>}
          </div>
        </div>

        {/* MESSAGE */}
        {message.text && (
          <div style={{ padding: '10px 16px', borderRadius: 12, marginBottom: '1rem', fontSize: 13, fontWeight: 600, background: message.isError ? '#fee2e2' : '#d1fae5', color: message.isError ? '#dc2626' : '#059669', border: `1px solid ${message.isError ? '#fecaca' : '#a7f3d0'}`, animation: 'slideUp 0.2s ease' }}>
            {message.text}
          </div>
        )}

        {/* DOCUMENTS */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <h3 style={{ color: '#1f2937', fontSize: 16, fontWeight: 700, margin: '0 0 1rem', paddingBottom: '0.875rem', borderBottom: '2px solid #f3f4f6' }}>📄 Document Status</h3>
          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
              <p style={{ margin: '0 0 16px', fontSize: 14 }}>No documents uploaded yet.</p>
              <button onClick={() => navigate('/upload')} style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>Upload Documents</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {documents.map(doc => {
                const ss = getStatusStyle(doc.status);
                const selectedFile = selectedFiles[doc._id];
                return (
                  <div key={doc._id} className="doc-row" style={{ background: '#fafafa', border: `1.5px solid ${ss.border}`, borderRadius: 14, padding: 'clamp(0.75rem,2vw,1rem)', transition: 'all 0.2s ease', borderLeft: `4px solid ${ss.color}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: doc.status === 'rejected' ? 12 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, background: `${ss.color}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{docIcons[doc.documentType] || '📄'}</div>
                        <div>
                          <p style={{ color: '#1f2937', fontWeight: 700, margin: 0, fontSize: 14 }}>{doc.documentName}</p>
                          <p style={{ color: '#9ca3af', margin: 0, fontSize: 11 }}>Uploaded: {formatDate(doc.uploadDate)}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>{ss.icon} {ss.label}</span>
                    </div>
                    {doc.status === 'rejected' && (
                      <div>
                        {doc.rejectionReason && (
                          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#dc2626', fontWeight: 500 }}>
                            ❌ Reason: {doc.rejectionReason}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <label style={{ flex: 1, padding: '8px 12px', background: 'white', border: `1.5px dashed ${selectedFile ? '#667eea' : '#d1d5db'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, color: selectedFile ? '#667eea' : '#9ca3af', textAlign: 'center', fontWeight: 500, transition: 'all 0.2s' }}>
                            {selectedFile ? `📎 ${selectedFile.name}` : '📤 Choose new PDF'}
                            <input type="file" accept=".pdf" onChange={e => setSelectedFiles(prev => ({ ...prev, [doc._id]: e.target.files[0] }))} hidden />
                          </label>
                          <button className="reup-btn" onClick={() => handleReUpload(doc._id)} disabled={updatingDoc === doc._id || !selectedFile}
                            style={{ padding: '8px 16px', background: selectedFile ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb', color: selectedFile ? 'white' : '#9ca3af', border: 'none', borderRadius: 8, cursor: selectedFile ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: selectedFile ? '0 2px 8px rgba(102,126,234,0.3)' : 'none' }}>
                            {updatingDoc === doc._id ? '⏳...' : '🔄 Re-upload'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HISTORY */}
        {history.length > 0 && (
          <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <h3 style={{ color: '#1f2937', fontSize: 16, fontWeight: 700, margin: '0 0 1rem', paddingBottom: '0.875rem', borderBottom: '2px solid #f3f4f6' }}>📅 Activity History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.slice(0, 8).map((e, i) => (
                <div key={i} className="hi" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: '#fafafa', transition: 'background 0.2s', borderLeft: `3px solid ${actionColors[e.action] || '#e5e7eb'}` }}>
                  <div style={{ width: 36, height: 36, background: `${actionColors[e.action] || '#9ca3af'}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{actionIcons[e.action] || '📋'}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#1f2937', fontWeight: 600, margin: 0, fontSize: 13 }}>{e.documentName}</p>
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: 11 }}>{e.action} by {e.performedByRole}</p>
                  </div>
                  <span style={{ color: '#d1d5db', fontSize: 11, flexShrink: 0 }}>{formatDate(e.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UpdateDocument;