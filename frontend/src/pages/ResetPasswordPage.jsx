import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage(m => ({ ...m, visible: false })), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return showMessage('Password must be at least 6 characters long');
    if (newPassword !== confirmPassword) return showMessage('Passwords do not match');
    setLoading(true);
    try {
      const data = await api.resetPassword(token, { newPassword });
      if (data.success) {
        showMessage('Password reset successful! Redirecting to login...', false);
        setTimeout(() => navigate('/'), 2000);
      } else {
        showMessage(data.message);
      }
    } catch {
      showMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', border: '1px solid #d1d5db',
    borderRadius: '0.75rem', outline: 'none', fontSize: '1rem', transition: 'all 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem' }}>

          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '5rem', height: '5rem', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937' }}>Create New Password</h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Please enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                <i className="fas fa-key" style={{ marginRight: '0.5rem', color: '#9ca3af' }}></i>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <i className={`fas ${showNew ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                <i className="fas fa-check-circle" style={{ marginRight: '0.5rem', color: '#9ca3af' }}></i>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <i className={`fas ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '2px' }}>Passwords do not match</p>
              )}
            </div>

            {message.visible && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', background: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#991b1b' : '#166534' }}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white', fontWeight: 600, border: 'none', borderRadius: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</> : 'Reset Password'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link to="/" style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none' }}>
                <i className="fas fa-arrow-left" style={{ marginRight: '0.25rem' }}></i>
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;