// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import HRDashboard from './pages/HRDashboard.jsx';
import UploadDocuments from './pages/UploadDocuments.jsx';
import ViewDocuments from './pages/ViewDocuments.jsx';
import UpdateDocument from './pages/UpdateDocument.jsx';
import CandidateLogin from './pages/CandidateLogin.jsx';
import HRLogin from './pages/HRLogin.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';  // ✅ Added
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';    // ✅ Added
import CandidateReports from './pages/CandidateReports.jsx';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('🔍 App.jsx - Checking authentication...');
    console.log('🔍 App.jsx - Token:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('🔍 App.jsx - UserData:', userData);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('✅ App.jsx - User authenticated:', parsedUser);
        
        // ✅ Check if user needs to change password
        if (parsedUser.isFirstLogin === true) {
          console.log('⚠️ User needs to change password - redirecting...');
          const role = parsedUser.role || 'candidate';
          window.location.href = `/${role}/change-password`;
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        setUser(parsedUser);
      } catch (e) {
        console.error('❌ App.jsx - Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    } else {
      console.log('❌ App.jsx - No token or userData found');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = '/candidate/login';
  };

  const getDashboardComponent = () => {
    if (user?.role === 'hr') return HRDashboard;
    return Dashboard;
  };

  const DashboardComponent = getDashboardComponent();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const requireAuth = (Component, role = null) => {
    if (!isAuthenticated) {
      const loginPath = role === 'hr' ? '/hr/login' : '/candidate/login';
      return <Navigate to={loginPath} replace />;
    }
    if (role && user?.role !== role) {
      const loginPath = role === 'hr' ? '/hr/login' : '/candidate/login';
      return <Navigate to={loginPath} replace />;
    }
    return Component;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Login Routes */}
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/hr/login" element={<HRLogin />} />

          {/* Forgot Password Routes */}
          <Route path="/candidate/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/hr/forgot-password" element={<ForgotPasswordPage />} />

          {/* Reset Password Routes */}
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/candidate/reset-password" element={<ResetPasswordPage />} />
          <Route path="/hr/reset-password" element={<ResetPasswordPage />} />

          {/* Change Password Routes */}
          <Route path="/candidate/change-password" element={<ChangePasswordPage />} />
          <Route path="/hr/change-password" element={<ChangePasswordPage />} />

          {/* Default redirect */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/candidate/dashboard'} />
                : <Navigate to="/candidate/login" />
            }
          />

          {/* Candidate Routes */}
          <Route
            path="/candidate/dashboard"
            element={requireAuth(<DashboardComponent user={user} onLogout={handleLogout} />, 'candidate')}
          />
          <Route
            path="/upload"
            element={requireAuth(<UploadDocuments user={user} />, 'candidate')}
          />
          <Route
            path="/documents"
            element={requireAuth(<ViewDocuments user={user} onLogout={handleLogout} />, 'candidate')}
          />
          <Route
            path="/verification-status"
            element={requireAuth(<UpdateDocument user={user} onLogout={handleLogout} />, 'candidate')}
          />
          <Route
            path="/reports"
            element={requireAuth(<CandidateReports user={user} onLogout={handleLogout} />, 'candidate')}
          />
          <Route
            path="/update/:documentId"
            element={requireAuth(<UpdateDocument user={user} />, 'candidate')}
          />

          {/* HR Routes */}
          <Route
            path="/hr/dashboard"
            element={requireAuth(<HRDashboard user={user} onLogout={handleLogout} />, 'hr')}
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={requireAuth(<div>Profile Page - Coming Soon</div>, 'candidate')}
          />

          {/* Catch all */}
          <Route
            path="*"
            element={<Navigate to="/candidate/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;