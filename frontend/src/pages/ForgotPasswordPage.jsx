import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { forgotPassword } from '../utils/api';  // ✅ Fixed import

function ForgotPasswordPage() {
  const { portalRole } = useParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const isHR = portalRole === 'hr';
  const accentColor = isHR ? '#1e3a5f' : '#667eea';
  const gradient = isHR ? 'linear-gradient(135deg, #1e3a5f, #2d6a4f)' : 'linear-gradient(135deg, #667eea, #764ba2)';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await forgotPassword(email);  // ✅ Fixed: using named import
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '999px', padding: '6px 16px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', letterSpacing: '1px' }}>
              {isHR ? 'HR PORTAL' : 'CANDIDATE PORTAL'} — PASSWORD RECOVERY
            </span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', background: gradient, borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <i className="fas fa-key" style={{ fontSize: '28px', color: 'white' }}></i>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>
              Forgot Password
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '56px', height: '56px', background: '#f0fdf4',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px',
                border: '2px solid #86efac'
              }}>
                <i className="fas fa-envelope-circle-check" style={{ fontSize: '24px', color: '#16a34a' }}></i>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
                Email Sent!
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                We've sent a reset link to <strong>{email}</strong>.
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                Check your inbox and follow the link to reset your password.
              </p>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>
                ⏱ Link expires in 15 minutes
              </p>
              <Link to={`/${portalRole}/login`} style={{
                display: 'inline-block', fontSize: '13px',
                color: accentColor, textDecoration: 'none', fontWeight: 600
              }}>
                <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="Enter your registered email"
                  style={{
                    width: '100%', padding: '10px 14px',
                    border: '1px solid #d1d5db', borderRadius: '10px',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = accentColor}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                  background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca'
                }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px',
                background: loading ? '#9ca3af' : gradient,
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  : <><i className="fas fa-paper-plane"></i> Send Reset Link</>
                }
              </button>

              <Link to={`/${portalRole}/login`} style={{
                textAlign: 'center', fontSize: '13px', color: accentColor,
                textDecoration: 'none', fontWeight: 500, display: 'block'
              }}>
                <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i>
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;