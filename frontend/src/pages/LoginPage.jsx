import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage(m => ({ ...m, visible: false })), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMessage('Login successful! Redirecting...', false);
        setTimeout(() => {
          if (data.isFirstLogin) navigate('/change-password');
        }, 1000);
      } else {
        showMessage(data.message);
        setLoading(false);
      }
    } catch {
      showMessage('Connection error. Is the server running?');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="login-card" style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '5rem', height: '5rem', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937' }}>VeriFlow</h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Automated Background Verification System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                <i className="fas fa-envelope" style={{ marginRight: '0.5rem', color: '#9ca3af' }}></i>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                autoComplete="username"
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)'; }}
                onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                <i className="fas fa-lock" style={{ marginRight: '0.5rem', color: '#9ca3af' }}></i>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.75rem', outline: 'none', fontSize: '1rem', transition: 'all 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <i className={`fas ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password" style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Message */}
            {message.visible && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', background: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#991b1b' : '#166534' }}>
                {message.text}
              </div>
            )}

            {/* Button */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white', fontWeight: 600, border: 'none', borderRadius: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem', transition: 'all 0.2s' }}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                : 'Sign In'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;