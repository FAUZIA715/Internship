import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

function CandidateLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  // Check for existing session and redirect appropriately
  const _token = localStorage.getItem('token');
  const _role = localStorage.getItem('role');
  if (_token && _role === 'candidate') { 
    window.location.replace('/candidate/dashboard'); 
    return null; 
  }
  if (_token && _role === 'hr') { 
    window.location.replace('/hr/dashboard'); 
    return null; 
  }

  const showMsg = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage(m => ({ ...m, visible: false })), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.login({ email, password, portalRole: 'candidate' });
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          isFirstLogin: data.isFirstLogin
        }));
        
        showMsg('Login successful! Redirecting...', false);
        
        setTimeout(() => {
          if (data.isFirstLogin) {
            window.location.href = '/candidate/change-password';
          } else {
            window.location.href = '/candidate/dashboard';
          }
        }, 1000);
      } else {
        showMsg(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('❌ Candidate Login error:', err);
      showMsg(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '999px',
            padding: '6px 16px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34d399'
            }}></div>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'white',
              letterSpacing: '1px'
            }}>
              CANDIDATE PORTAL
            </span>
          </div>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 16px rgba(102,126,234,0.4)'
            }}>
              <i className="fas fa-user-circle" style={{ fontSize: '28px', color: 'white' }}></i>
            </div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#1f2937',
              margin: '0 0 4px'
            }}>
              Candidate Login
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: 0
            }}>
              VeriFlow Background Verification
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#667eea'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '6px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#667eea'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <div style={{
              textAlign: 'right',
              marginTop: '-4px'
            }}>
              <Link
                to="/candidate/forgot-password"
                style={{
                  fontSize: '13px',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Forgot password?
              </Link>
            </div>

            {message.visible && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                background: message.isError ? '#fee2e2' : '#dcfce7',
                color: message.isError ? '#991b1b' : '#166534',
                border: `1px solid ${message.isError ? '#fecaca' : '#bbf7d0'}`
              }}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.3s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #f3f4f6'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              Are you an HR?{' '}
              <Link
                to="/hr/login"
                style={{
                  color: '#667eea',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                HR Portal →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateLogin;