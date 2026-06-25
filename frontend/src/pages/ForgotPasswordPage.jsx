import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { forgotPassword } from '../utils/api';

function ForgotPasswordPage({ portalRole: propRole }) {
  const { portalRole: paramRole } = useParams();
  const portalRole = propRole || paramRole || 'candidate';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const isHR = portalRole === 'hr';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await forgotPassword(email);
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden'
    }}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .inp:focus{border-color:rgba(255,255,255,0.7)!important;background:rgba(255,255,255,0.18)!important;}
        .sbtn:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(0,0,0,0.2)!important;}
        .back:hover{text-decoration:underline!important;}
      `}</style>

      {/* BG decoration */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 350, height: 350, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: -120, left: -120, width: 350, height: 350, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1, animation: 'fadeIn 0.5s ease' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 }}>🔑</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>VeriFlow</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 13 }}>Background Verification System</p>
        </div>

        {/* CARD */}
        <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '1.75rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

          {/* PORTAL BADGE */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.15)', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: 1, textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', display: 'inline-block' }}></span>
              {isHR ? '🏢 HR Portal' : '👤 Candidate Portal'} — Password Recovery
            </span>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: '0 0 10px' }}>Email Sent!</h3>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 6px' }}>
                We've sent a reset link to <strong style={{ color: 'white' }}>{email}</strong>
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 6px' }}>Check your inbox and follow the link to reset your password.</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 24px' }}>⏱ Link expires in 15 minutes</p>
              <a href="/candidate/login" className="back" style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }}>
                ← Back to Login
              </a>
            </div>
          ) : (
            <>
              <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 4px', textAlign: 'center' }}>Forgot Password?</h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 1.5rem', textAlign: 'center' }}>
                Enter your {isHR ? 'HR' : 'registered'} email to receive a reset link
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.7 }}>Email Address</label>
                  <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={isHR ? 'Enter your HR email' : 'Enter your registered email'}
                    style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, outline: 'none', color: 'white', boxSizing: 'border-box', transition: 'all 0.2s' }}
                  />
                </div>

                {error && (
                  <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'rgba(239,68,68,0.2)', color: '#fecaca', border: '1px solid rgba(239,68,68,0.4)' }}>
                    ❌ {error}
                  </div>
                )}

                <button type="submit" className="sbtn" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.95)', color: loading ? 'rgba(255,255,255,0.5)' : '#667eea', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.25s', marginTop: 4 }}>
                  {loading ? '⏳ Sending...' : '📨 Send Reset Link'}
                </button>

                <div style={{ textAlign: 'center', marginTop: 4 }}>
                  <a href="/candidate/login" className="back" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }}>
                    ← Back to Login
                  </a>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
