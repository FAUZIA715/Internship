import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { login } from '../utils/api';

// Password strength validator — same rules as backend
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('One special character (!@#$%^&*)');
  return errors;
};

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { portalRole, token } = useParams();
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
      const data = await api.resetPassword(token, { newPassword });
      if (data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate(`/${portalRole}/login`), 2000);
      } else {
        setError(data.message);
      }
    } catch {
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
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)', borderRadius: '999px', padding: '6px 16px'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa' }}></div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'white', letterSpacing: '1px' }}>
              {isHR ? 'HR PORTAL' : 'CANDIDATE PORTAL'} — RESET PASSWORD
            </span>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: '2rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', background: gradient, borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '28px', color: 'white' }}></i>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>
              Reset Password
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* New Password */}
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

              {/* Strength Bar */}
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
                  <p style={{ fontSize: '11px', color: strengthColor(), fontWeight: 600 }}>
                    {strengthLabel()}
                  </p>
                </div>
              )}

              {/* Requirements checklist */}
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

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Confirm Password
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

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca'
              }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'
              }}>
                <i className="fas fa-check-circle" style={{ marginRight: '6px' }}></i>
                {success}
              </div>
            )}

            {/* Submit */}
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
                ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
                : <><i className="fas fa-check"></i> Reset Password</>
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
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
