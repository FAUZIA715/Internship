import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState('not_uploaded');
  const [panStatus, setPanStatus] = useState('not_uploaded');
  const [degreeStatus, setDegreeStatus] = useState('not_uploaded');
  const [employmentStatus, setEmploymentStatus] = useState('not_uploaded');

  useEffect(() => { fetchCandidate(); }, [id]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/hr/candidates/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setCandidate(data);
      setAadhaarStatus(data.aadhaarStatus || 'not_uploaded');
      setPanStatus(data.panStatus || 'not_uploaded');
      setDegreeStatus(data.degreeStatus || 'not_uploaded');
      setEmploymentStatus(data.employmentStatus || 'not_uploaded');
    } catch (e) {}
    finally { setLoading(false); }
  };

  const showMsg = (text) => { setMessage(text); setTimeout(() => setMessage(''), 5000); };

  const handleUpdate = async (docType, status) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-document/${docType}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) { showMsg(`✅ ${docType} updated to ${status}`); fetchCandidate(); }
      else showMsg(`❌ ${data.message}`);
    } catch { showMsg(`❌ Failed to update`); }
    finally { setUpdating(false); }
  };

  const handleView = (docType) => {
    const doc = candidate?.documents?.[docType];
    if (!doc?.filePath) { alert('Document not available'); return; }
    if (doc.filePath.startsWith('http')) {
      window.open(`https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(doc.filePath)}`, '_blank');
    } else alert('Ask candidate to re-upload.');
  };

  const handleGenerate = async () => {
    const allV = [aadhaarStatus, panStatus, degreeStatus, employmentStatus].every(s => s === 'verified');
    if (!allV) { showMsg('❌ All 4 documents must be verified first.'); return; }
    setGenerating(true); showMsg('⏳ Generating report...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/reports/generate/${candidate._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { showMsg('❌ Session expired.'); setTimeout(() => navigate('/candidate/login'), 2000); return; }
      const data = await res.json();
      if (res.ok && data.success) {
        const decision = data.report?.reportData?.finalDecision || data.report?.finalDecision || 'Pending';
        showMsg(`✅ Report generated! Decision: ${decision}`);
        setCandidate(prev => ({ ...prev, reportGenerated: true, reportId: data.report?._id || data.report?.id }));
      } else showMsg(`❌ ${data.message || 'Failed'}`);
    } catch { showMsg('❌ Could not generate report.'); }
    finally { setGenerating(false); }
  };

  const handleDownload = async () => {
    if (!candidate?.reportId) { showMsg('❌ No report yet.'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/reports/download/${candidate.reportId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401) { showMsg('❌ Session expired.'); setTimeout(() => navigate('/candidate/login'), 2000); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `BGV_Report_${candidate?.name}.pdf`; a.click();
      URL.revokeObjectURL(url); showMsg('✅ Download started!');
    } catch { showMsg('❌ Download failed.'); }
  };

  const hrStatus = () => {
    const s = [aadhaarStatus, panStatus, degreeStatus, employmentStatus];
    if (s.every(x => x === 'verified')) return { label: 'Approved', color: '#059669', bg: '#d1fae5', border: '#a7f3d0' };
    if (s.some(x => x === 'rejected')) return { label: 'Rejected', color: '#dc2626', bg: '#fee2e2', border: '#fecaca' };
    return { label: 'Pending', color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
  };

  const badge = (status) => {
    const map = {
      verified: { bg: '#d1fae5', color: '#059669', label: '✅ Verified' },
      rejected: { bg: '#fee2e2', color: '#dc2626', label: '❌ Rejected' },
      pending: { bg: '#fef3c7', color: '#d97706', label: '⏳ Pending' },
      not_uploaded: { bg: '#f3f4f6', color: '#9ca3af', label: '📄 Not Uploaded' },
    };
    const s = map[status] || map['not_uploaded'];
    return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  const docCards = [
    { type: 'aadhaar', label: '🪪 Aadhaar Card', status: aadhaarStatus, setStatus: setAadhaarStatus },
    { type: 'pan', label: '💳 PAN Card', status: panStatus, setStatus: setPanStatus },
    { type: 'degree', label: '🎓 Degree Certificate', status: degreeStatus, setStatus: setDegreeStatus },
    { type: 'employment', label: '💼 Employment Proof', status: employmentStatus, setStatus: setEmploymentStatus },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui" }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!candidate) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <p>Candidate not found</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, padding: '8px 20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>← Go Back</button>
      </div>
    </div>
  );

  const status = hrStatus();
  const allVerified = status.label === 'Approved';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 'clamp(1rem,3vw,1.5rem)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        .dc:hover{transform:translateY(-3px)!important;box-shadow:0 12px 28px rgba(102,126,234,0.15)!important;}
        .upd:hover{transform:scale(1.05)!important;}
        .view:hover{background:#f5f3ff!important;color:#667eea!important;}
        .back:hover{background:linear-gradient(135deg,#667eea,#764ba2)!important;color:white!important;}
        select option{background:#fff;color:#1f2937;}
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', animation: 'slideUp 0.45s ease' }}>

        {/* HEADER */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(102,126,234,0.2)', flexWrap: 'wrap', gap: 10 }}>
          <button className="back" onClick={() => navigate(-1)} style={{ padding: '8px 18px', background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#667eea', transition: 'all 0.2s' }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
            <span style={{ color: '#1f2937', fontWeight: 800, fontSize: 16 }}>VeriFlow</span>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div style={{ padding: '10px 16px', borderRadius: 12, marginBottom: '1rem', fontSize: 13, fontWeight: 600, background: message.includes('✅') ? '#d1fae5' : message.includes('⏳') ? '#fef3c7' : '#fee2e2', color: message.includes('✅') ? '#059669' : message.includes('⏳') ? '#d97706' : '#dc2626', border: `1px solid ${message.includes('✅') ? '#a7f3d0' : message.includes('⏳') ? '#fde68a' : '#fecaca'}`, animation: 'slideUp 0.2s ease' }}>
            {message}
          </div>
        )}

        {/* PROFILE */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 28, fontWeight: 800, flexShrink: 0, boxShadow: '0 4px 16px rgba(102,126,234,0.4)' }}>{candidate.name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: '#1f2937', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>{candidate.name}</h2>
              <p style={{ color: '#9ca3af', margin: '0 0 2px', fontSize: 13 }}>📧 {candidate.email}</p>
              <p style={{ color: '#9ca3af', margin: 0, fontSize: 13 }}>💼 {candidate.position || 'N/A'}</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, padding: '6px 16px', borderRadius: 20, background: status.bg, color: status.color, border: `1.5px solid ${status.border}` }}>⭐ {status.label}</span>
          </div>
        </div>

        {/* DOCUMENTS */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
          <h3 style={{ color: '#1f2937', fontSize: 16, fontWeight: 700, margin: '0 0 1.25rem', paddingBottom: '0.875rem', borderBottom: '2px solid #f3f4f6' }}>📄 Document Verification</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem' }}>
            {docCards.map(doc => (
              <div key={doc.type} className="dc" style={{ background: '#fafafa', borderRadius: 16, padding: '1.125rem', border: '1.5px solid #e5e7eb', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#1f2937', fontWeight: 700, fontSize: 14 }}>{doc.label}</span>
                  {badge(doc.status)}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select value={doc.status} onChange={e => doc.setStatus(e.target.value)}
                    style={{ flex: 1, padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', outline: 'none', color: '#374151', fontWeight: 500, transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#667eea'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                    <option value="pending">⏳ Pending</option>
                    <option value="verified">✅ Verified</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                  <button className="upd" onClick={() => handleUpdate(doc.type, doc.status)} disabled={updating}
                    style={{ padding: '8px 14px', background: updating ? '#e5e7eb' : 'linear-gradient(135deg, #667eea, #764ba2)', color: updating ? '#9ca3af' : 'white', border: 'none', borderRadius: 8, cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 12, transition: 'all 0.2s', boxShadow: updating ? 'none' : '0 2px 8px rgba(102,126,234,0.3)' }}>Update</button>
                  <button className="view" onClick={() => handleView(doc.type)}
                    style={{ padding: '8px 12px', background: '#f5f3ff', border: '1.5px solid #c4b5fd', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#667eea', fontWeight: 600, transition: 'all 0.2s' }}>👁️ View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REPORT */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: 'clamp(1rem,3vw,1.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1f2937', fontSize: 16, fontWeight: 700, margin: '0 0 1rem', paddingBottom: '0.875rem', borderBottom: '2px solid #f3f4f6' }}>📋 BGV Report</h3>
          {!allVerified && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: '1rem', fontSize: 13, color: '#d97706', fontWeight: 500 }}>
              ⚠️ All 4 documents must be verified before generating a report.
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
            <button onClick={handleGenerate} disabled={!allVerified || generating}
              style={{ flex: 1, minWidth: 160, padding: '13px 20px', background: allVerified && !generating ? 'linear-gradient(135deg, #059669, #10b981)' : '#e5e7eb', color: allVerified && !generating ? 'white' : '#9ca3af', border: 'none', borderRadius: 14, cursor: allVerified && !generating ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15, transition: 'all 0.25s', boxShadow: allVerified && !generating ? '0 4px 14px rgba(5,150,105,0.3)' : 'none' }}
              onMouseEnter={e => { if (allVerified && !generating) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              {generating ? '⏳ Generating...' : '📄 Generate Report'}
            </button>
            <button onClick={handleDownload} disabled={!candidate?.reportId}
              style={{ flex: 1, minWidth: 160, padding: '13px 20px', background: candidate?.reportId ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e5e7eb', color: candidate?.reportId ? 'white' : '#9ca3af', border: 'none', borderRadius: 14, cursor: candidate?.reportId ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15, transition: 'all 0.25s', boxShadow: candidate?.reportId ? '0 4px 14px rgba(102,126,234,0.3)' : 'none' }}
              onMouseEnter={e => { if (candidate?.reportId) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              ⬇️ Download Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateDetails;