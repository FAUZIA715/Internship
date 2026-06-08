import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage(m => ({ ...m, visible: false })), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showMessage('Passwords do not match');
    if (newPassword.length < 6) return showMessage('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await api.changePassword({ oldPassword, newPassword });
      if (data.success) {
        showMessage('Password updated successfully! Redirecting...', false);
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
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937' }}>Change Password</h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Please set a new password to secure your account</p>
          </div>

          {/* Warning */}
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: '#92400e' }}>
            <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px', flexShrink: 0 }}></i>
            <span>You are using a temporary password. Please change it immediately.</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {[
              { label: 'Current Password', value: oldPassword, setter: setOldPassword, placeholder: 'Enter current password', icon: 'fa-lock' },
              { label: 'New Password', value: newPassword, setter: setNewPassword, placeholder: 'Enter new password', icon: 'fa-key' },
              { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Confirm new password', icon: 'fa-check-circle' },
            ].map(({ label, value, setter, placeholder, icon }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                  <i className={`fas ${icon}`} style={{ marginRight: '0.5rem', color: '#9ca3af' }}></i>
                  {label}
                </label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  required
                  placeholder={placeholder}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.2)'; }}
                  onBlur={e => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
                />
                {label === 'Confirm New Password' && confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>Passwords do not match</p>
                )}
              </div>
            ))}

            {message.visible && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', background: message.isError ? '#fee2e2' : '#dcfce7', color: message.isError ? '#991b1b' : '#166534' }}>
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', color: 'white', fontWeight: 600, border: 'none', borderRadius: '0.75rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem' }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;