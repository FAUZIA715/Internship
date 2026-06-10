import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: true, visible: false });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const showMessage = (text, isError = true) => {
    setMessage({ text, isError, visible: true });
    setTimeout(() => setMessage({ ...message, visible: false }), 4000);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const remember = localStorage.getItem('remember');
    if (remember === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(email, password);
      
      console.log('Login Response:', response); // Debug log
      
      if (response.success) {
        // Save remember me preference
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
          localStorage.setItem('remember', 'true');
        } else {
          localStorage.removeItem('savedEmail');
          localStorage.setItem('remember', 'false');
        }
        
        // IMPORTANT: Make sure token is saved
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('Token saved:', response.token); // Debug log
        }
        
        // Save user data
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          token: response.token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        showMessage('✅ Login successful! Redirecting...', false);
        
        // Call onLogin to update App state
        onLogin(userData);
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage(error.message || '❌ Invalid credentials');
    } finally {
      setIsLoading(false);
    }
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
    </div>
  );
};

export default Login;