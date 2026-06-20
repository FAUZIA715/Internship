import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('One special character (!@#$%^&*)');
  return errors;
};

function ChangePasswordPage() {
  const { portalRole } = useParams();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isHR = portalRole === 'hr';
  const accentColor = isHR ? '#1e3a5f' : '#667eea';
  const gradient = isHR ? 'linear-gradient(135deg, #1e3a5f, #2d6a4f)' : 'linear-gradient(135deg, #667eea, #764ba2)';

  const passwordErrors = newPassword ? validatePassword(newPassword) : [];
  const passwordStrength = 5 - passwordErrors.length;

  const strengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength <= 2) return '#f97316';
    if (passwordStrength <= 3) return '#eab308';
    if (passwordStrength <= 4) return '#84cc16';
    return '#22c55e';
  };

  const strengthLabel = () => {
    if (passwordStrength <= 1) return 'Very Weak';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setError(`Password requirements not met: ${errors[0]}`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await api.changePassword({ oldPassword, newPassword });
      if (data.success) {
        setSuccess('Password updated successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = `/${portalRole}/dashboard`;
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
      <div style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '999px', padding: '6px 16px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', letterSpacing: '1px' }}>
              {isHR ? 'HR PORTAL' : 'CANDIDATE PORTAL'} — ACTION REQUIRED
            </span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', background: gradient, borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <i className="fas fa-lock" style={{ fontSize: '28px', color: 'white' }}></i>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>
              Change Password
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Please set a new password to continue
            </p>
          </div>

          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px',
            padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#92400e',
            display: 'flex', gap: '8px'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ marginTop: '2px', flexShrink: 0 }}></i>
            <span>You are using a temporary password. Please change it immediately.</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Current Password
              </label>
              <input
                type="password" value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required placeholder="Enter current password"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                New Password
              </label>
              <input
                type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required placeholder="Min 8 chars, uppercase, number, special"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />

              {newPassword && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= passwordStrength ? strengthColor() : '#e5e7eb',
                        transition: 'background 0.2s'
                      }}></div>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: strengthColor(), fontWeight: 600 }}>{strengthLabel()}</p>
                </div>
              )}

              {newPassword && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {[
                    { label: 'At least 8 characters', test: newPassword.length >= 8 },
                    { label: 'One uppercase letter', test: /[A-Z]/.test(newPassword) },
                    { label: 'One lowercase letter', test: /[a-z]/.test(newPassword) },
                    { label: 'One number', test: /[0-9]/.test(newPassword) },
                    { label: 'One special character', test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
                  ].map(({ label, test }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className={`fas ${test ? 'fa-check-circle' : 'fa-circle'}`}
                        style={{ fontSize: '11px', color: test ? '#22c55e' : '#d1d5db' }}></i>
                      <span style={{ fontSize: '11px', color: test ? '#16a34a' : '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required placeholder="Re-enter new password"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = accentColor}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
                  <i className="fas fa-times-circle" style={{ marginRight: '4px' }}></i>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
                  <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i>
                  Passwords match
                </p>
              )}
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

            {success && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'
              }}>
                <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
                {success}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px',
              background: loading ? '#9ca3af' : gradient,
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px'
            }}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Updating...</>
                : <><i className="fas fa-check"></i> Update Password</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
