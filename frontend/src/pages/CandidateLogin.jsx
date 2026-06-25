import { useState } from 'react';
import { api } from '../utils/api';

function CandidateLogin() {
  const _token = localStorage.getItem('token');
  const _role = localStorage.getItem('role');
  if (_token && _role === 'candidate') { window.location.replace('/candidate/dashboard'); return null; }
  if (_token && _role === 'hr') { window.location.replace('/hr/dashboard'); return null; }

  const [role, setRole] = useState('candidate');
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
      const data = await api.login({ email, password, portalRole: role });
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('user', JSON.stringify(data.user));
        showMsg('Login successful! Redirecting...', false);
        setTimeout(() => {
          if (role === 'hr') {
            window.location.href = data.isFirstLogin ? '/hr/change-password' : '/hr/dashboard';
          } else {
            window.location.href = data.isFirstLogin ? '/candidate/change-password' : '/candidate/dashboard';
          }
        }, 1000);
      } else {
        showMsg(data.message);
      }
    } catch (err) {
      showMsg(err.message || 'Something went wrong. Please try again.');
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
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.3)}50%{box-shadow:0 0 0 8px rgba(255,255,255,0)}}
        .role-btn:hover{background:rgba(255,255,255,0.15)!important;}
        .sign-btn:hover{transform:translateY(-2px)!important;box-shadow:0 8px 28px rgba(0,0,0,0.25)!important;}
        .inp:focus{border-color:rgba(255,255,255,0.7)!important;background:rgba(255,255,255,0.18)!important;}
        .fp:hover{text-decoration:underline!important;opacity:1!important;}
      `}</style>

      {/* BG decoration */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 350, height: 350, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: -120, left: -120, width: 350, height: 350, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '40%', left: '10%', width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }}></div>

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1, animation: 'fadeIn 0.5s ease' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 70, height: 70, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <span style={{ fontSize: 32 }}>🛡️</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>VeriFlow</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: 14 }}>Background Verification System</p>
        </div>

        {/* CARD */}
        <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '1.75rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

          {/* ROLE TOGGLE */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', borderRadius: 14, padding: 4, marginBottom: '1.75rem', gap: 4 }}>
            {['candidate', 'hr'].map(r => (
              <button key={r} type="button" className="role-btn" onClick={() => setRole(r)}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 11, cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', letterSpacing: 0.3,
                  background: role === r ? 'rgba(255,255,255,0.95)' : 'transparent',
                  color: role === r ? '#667eea' : 'rgba(255,255,255,0.65)',
                  boxShadow: role === r ? '0 4px 16px rgba(0,0,0,0.15)' : 'none',
                  transform: role === r ? 'scale(1.02)' : 'scale(1)',
                }}>
                {r === 'candidate' ? '👤 Candidate' : '🏢 HR Manager'}
              </button>
            ))}
          </div>

          <h2 style={{ color: 'white', fontSize: 21, fontWeight: 700, margin: '0 0 4px', textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '0 0 1.5rem', textAlign: 'center' }}>
            Sign in as {role === 'hr' ? 'HR Manager' : 'Candidate'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.7 }}>Email Address</label>
              <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email"
                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, outline: 'none', color: 'white', boxSizing: 'border-box', transition: 'all 0.2s' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="inp" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, fontSize: 14, outline: 'none', color: 'white', boxSizing: 'border-box', transition: 'all 0.2s' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: -4 }}>
              <a href={`/${role}/forgot-password`} className="fp" style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600, transition: 'all 0.2s' }}>
                Forgot password?
              </a>
            </div>

            {message.visible && (
              <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, background: message.isError ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: message.isError ? '#fecaca' : '#bbf7d0', border: `1px solid ${message.isError ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`, backdropFilter: 'blur(8px)' }}>
                {message.text}
              </div>
            )}

            <button type="submit" className="sign-btn" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.95)', color: loading ? 'rgba(255,255,255,0.5)' : '#667eea', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(0,0,0,0.15)', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', letterSpacing: 0.3, marginTop: 4 }}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>

          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>© 2026 VeriFlow BGV System · Aibi Tech</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateLogin;