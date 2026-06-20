import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CandidateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [updating, setUpdating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState('not_uploaded');
  const [panStatus, setPanStatus] = useState('not_uploaded');
  const [degreeStatus, setDegreeStatus] = useState('not_uploaded');
  const [employmentStatus, setEmploymentStatus] = useState('not_uploaded');
  // address proof removed from BGV scope

  useEffect(() => { fetchCandidate(); }, [id]);

  const fetchCandidate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCandidate(data);
      setAadhaarStatus(data.aadhaarStatus || 'not_uploaded');
      setPanStatus(data.panStatus || 'not_uploaded');
      setDegreeStatus(data.degreeStatus || 'not_uploaded');
      setEmploymentStatus(data.employmentStatus || 'not_uploaded');
      // address excluded from BGV
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: '', isError: false }), 4000);
  };

  const handleUpdateDocument = async (docType, status) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hr/candidates/${id}/update-document/${docType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        showMsg(`✅ ${docType} updated to ${status}`);
        fetchCandidate();
      } else {
        showMsg(`❌ ${data.message}`, true);
      }
    } catch {
      showMsg(`❌ Failed to update ${docType}`, true);
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDocument = (docType) => {
    const doc = candidate?.documents?.[docType];
    if (!doc) { alert(`❌ ${docType} document not uploaded`); return; }
    if (!doc.documentId) { alert(`❌ Document ID not found`); return; }
    window.open(`http://localhost:5000/api/hr/view-document/${doc.documentId}`, '_blank');
  };

  const handleGenerateReport = async () => {
    if (!allVerified) { showMsg('❌ All documents must be verified first.', true); return; }
    setGenerating(true);
    showMsg('⏳ Generating BGV Report...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/generate/${candidate._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        showMsg(`✅ Report generated! Decision: ${data.report.finalDecision}`);
        setCandidate({ ...candidate, reportGenerated: true, reportId: data.report.id });
      } else {
        showMsg(`❌ ${data.message}`, true);
      }
    } catch { showMsg('❌ Could not generate report.', true); }
    finally { setGenerating(false); }
  };

  const handleDownloadReport = async () => {
    if (!candidate?.reportId) { showMsg('❌ No report available.', true); return; }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reports/download/${candidate.reportId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `BGV_Report_${candidate.name}.pdf`; a.click();
      URL.revokeObjectURL(url);
      showMsg('✅ Download started!');
    } catch { showMsg('❌ Download failed', true); }
  };

  const getHrStatus = () => {
    const statuses = [aadhaarStatus, panStatus, degreeStatus, employmentStatus]; // address excluded
    if (statuses.every(s => s === 'verified')) return { label: 'Approved', color: '#16a34a', bg: '#dcfce7' };
    if (statuses.some(s => s === 'rejected')) return { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' };
    return { label: 'Pending', color: '#d97706', bg: '#fef3c7' };
  };

  const getBadge = (status) => {
    const map = {
      verified: { label: '✅ Verified', color: '#16a34a', bg: '#dcfce7' },
      rejected: { label: '❌ Rejected', color: '#dc2626', bg: '#fee2e2' },
      pending: { label: '⏳ Pending', color: '#d97706', bg: '#fef3c7' },
      not_uploaded: { label: '📄 Not Uploaded', color: '#6b7280', bg: '#f3f4f6' },
    };
    const s = map[status] || map['not_uploaded'];
    return <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>
        ⏳ Loading...
      </div>
    );
  }

  if (!candidate) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>
        ❌ Candidate not found
      </div>
    );
  }

  const hrStatus = getHrStatus();
  const allVerified = aadhaarStatus === 'verified' && panStatus === 'verified' && degreeStatus === 'verified' && employmentStatus === 'verified'; // address excluded

  const docCards = [
    { type: 'aadhaar', label: '🆔 Aadhaar Card', status: aadhaarStatus, setStatus: setAadhaarStatus },
    { type: 'pan', label: '💳 PAN Card', status: panStatus, setStatus: setPanStatus },
    { type: 'degree', label: '🎓 Degree Certificate', status: degreeStatus, setStatus: setDegreeStatus },
    { type: 'employment', label: '💼 Employment Proof', status: employmentStatus, setStatus: setEmploymentStatus },
    // address proof removed from BGV scope
  ];

  const S = { wrap: { minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)', padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif" } };

  return (
    <div style={S.wrap}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: '#f3f4f6', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#374151' }}>
            ← Back
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>{candidate.name}</h1>
          <div style={{ width: 80 }}></div>
        </div>

        {/* MESSAGE */}
        {message.text && (
          <div style={{ background: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#991b1b' : '#166534', border: `1px solid ${message.isError ? '#fecaca' : '#bbf7d0'}`, borderRadius: 12, padding: '12px 20px', marginBottom: '1.5rem', fontWeight: 500, fontSize: 14 }}>
            {message.text}
          </div>
        )}

        {/* PROFILE CARD */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem 2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 700, flexShrink: 0 }}>
              {candidate.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>{candidate.name}</h2>
              <p style={{ color: '#6b7280', margin: '0 0 4px', fontSize: 14 }}>📧 {candidate.email}</p>
              <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>💼 {candidate.position || 'N/A'}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 20, background: hrStatus.bg, color: hrStatus.color }}>
                ⭐ {hrStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* DOCUMENT VERIFICATION */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem 2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>📄 Document Verification</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {docCards.map(doc => (
              <div key={doc.type} style={{ background: '#f9fafb', borderRadius: 16, padding: '1.25rem', border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 700, color: '#1e293b', margin: '0 0 8px', fontSize: 15 }}>{doc.label}</p>
                <div style={{ marginBottom: 12 }}>{getBadge(doc.status)}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select value={doc.status} onChange={e => doc.setStatus(e.target.value)}
                    style={{ flex: 1, padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 8, background: 'white', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <button onClick={() => handleUpdateDocument(doc.type, doc.status)} disabled={updating}
                    style={{ padding: '7px 14px', background: updating ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white', border: 'none', borderRadius: 8, cursor: updating ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12 }}>
                    Update
                  </button>
                  <button onClick={() => handleViewDocument(doc.type)}
                    style={{ padding: '7px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 600 }}>
                    👁️ View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REPORT ACTIONS */}
        <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem 2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', margin: '0 0 1rem' }}>📋 BGV Report</h3>
          {!allVerified && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 16px', marginBottom: '1rem', fontSize: 13, color: '#92400e' }}>
              ⚠️ All documents must be verified before generating a report.
            </div>
          )}
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={handleGenerateReport} disabled={!allVerified || generating}
              style={{ flex: 1, padding: '12px 24px', background: allVerified && !generating ? 'linear-gradient(135deg, #10b981, #059669)' : '#9ca3af', color: 'white', border: 'none', borderRadius: 12, cursor: allVerified && !generating ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15 }}>
              {generating ? '⏳ Generating...' : '📄 Generate BGV Report'}
            </button>
            <button onClick={handleDownloadReport} disabled={!candidate?.reportId}
              style={{ flex: 1, padding: '12px 24px', background: candidate?.reportId ? 'linear-gradient(135deg, #3b82f6, #7c3aed)' : '#9ca3af', color: 'white', border: 'none', borderRadius: 12, cursor: candidate?.reportId ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 15 }}>
              ⬇️ Download Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateDetails;