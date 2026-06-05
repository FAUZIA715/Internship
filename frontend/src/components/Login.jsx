// components/Login.jsx
import React, { useState, useEffect } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState({ text: '', isError: true, visible: false });

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const remember = localStorage.getItem('remember');
    if (remember === 'true' && savedEmail) {
      setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ ...message, visible: false }), 4000);
  };

  const showResetMessage = (text, isError = true) => {
    setResetMessage({ text, isError, visible: true });
    setTimeout(() => setResetMessage({ ...resetMessage, visible: false }), 4000);
  };

  const saveCredentials = (email, password) => {
    if (rememberMe) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('savedPassword', password);
      localStorage.setItem('remember', 'true');
    } else {
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('savedPassword');
      localStorage.setItem('remember', 'false');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email === 'admin@veriflow.com' && password === 'admin123') {
        saveCredentials(email, password);
        showMessage('✅ Admin login successful! Redirecting...', false);
        setTimeout(() => {
          onLogin({ email, role: 'admin', name: 'Administrator' });
        }, 1000);
      } 
      else if (email === 'candidate@veriflow.com' && password === 'cand123') {
        saveCredentials(email, password);
        showMessage('✅ Candidate login successful! Redirecting...', false);
        setTimeout(() => {
          onLogin({ email, role: 'candidate', name: 'John Candidate', id: 'CAND-001' });
        }, 1000);
      }
      else {
        showMessage('❌ Invalid credentials. Use admin@veriflow.com/admin123 or candidate@veriflow.com/cand123');
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showResetMessage('Please enter your email address');
      return;
    }

    const resetToken = Math.random().toString(36).substring(2, 20);
    localStorage.setItem(`reset_${resetEmail}`, resetToken);
    
    console.log(`========================================`);
    console.log(`📧 Password Reset Email Sent to: ${resetEmail}`);
    console.log(`🔗 Reset Link: http://localhost:5173/reset-password.html?token=${resetToken}&email=${encodeURIComponent(resetEmail)}`);
    console.log(`========================================`);
    
    showResetMessage(`✅ Reset link sent to ${resetEmail}! Check console for demo link.`, false);
    
    setTimeout(() => {
      setShowForgotModal(false);
      setResetEmail('');
    }, 2000);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h2 className="logo-text">VeriFlow</h2>
            <p className="tagline">Automated Background Verification System</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-envelope"></i> Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="input-field"
                placeholder="Enter your email"
                autoComplete="username"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">
                <i className="fas fa-lock"></i> Password
              </label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="input-field"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  <i className={showPassword ? "fas fa-eye" : "fas fa-eye-slash"}></i>
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="forgot-link"
              >
                Forgot password?
              </button>
            </div>
            
            {message.visible && (
              <div className={`message ${message.isError ? 'error' : 'success'}`}>
                {message.text}
              </div>
            )}
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="modal-close">&times;</button>
            </div>
            <p className="modal-description">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgotSubmit}>
              <input 
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="input-field"
                placeholder="Enter your email address"
              />
              {resetMessage.visible && (
                <div className={`message ${resetMessage.isError ? 'error' : 'success'} mt-3`}>
                  {resetMessage.text}
                </div>
              )}
              <button type="submit" className="login-btn mt-4">
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;