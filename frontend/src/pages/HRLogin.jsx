import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../utils/api'; // ✅ Fixed import

function HRLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  const showMsg = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage(m => ({ ...m, visible: false })), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Using named import 'login'
      const data = await login(email, password, 'hr');
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMsg('Login successful! Redirecting...', false);
        setTimeout(() => {
          if (data.isFirstLogin) {
            navigate('/hr/change-password');
          } else {
            navigate('/hr/dashboard');
          }
        }, 1000);
      } else {
        // In HRLogin.jsx, inside handleSubmit, add this line:
console.log('🔍 Sending login request with:', { email, password, portalRole: 'hr' });
        showMsg(data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('HR Login error:', error);
      showMsg('Connection error. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)',
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
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', letterSpacing: '1px' }}>
              HR PORTAL
            </span>
          </div>
        </div>

        <div style={{
          background: 'white', borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, #1e3a5f, #2d6a4f)',
              borderRadius: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(30,58,95,0.4)'
            }}>
              <i className="fas fa-user-tie" style={{ fontSize: '28px', color: 'white' }}></i>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>
              HR Login
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              VeriFlow Background Verification
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="Enter your email"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
                  style={{ width: '100%', padding: '10px 40px 10px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#1e3a5f'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '-4px' }}>
              <Link to="/hr/forgot-password" style={{ fontSize: '13px', color: '#1e3a5f', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>

            {message.visible && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: message.isError ? '#fee2e2' : '#dcfce7',
                color: message.isError ? '#991b1b' : '#166534',
                border: `1px solid ${message.isError ? '#fecaca' : '#bbf7d0'}`
              }}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e3a5f, #2d6a4f)',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px',
              fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                : <><i className="fas fa-sign-in-alt"></i> Sign In</>
              }
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>
              Are you a Candidate?{' '}
              <Link to="/candidate/login" style={{ color: '#667eea', fontWeight: 600, textDecoration: 'none' }}>
                Candidate Portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HRLogin;