// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
import CandidateLogin from './pages/CandidateLogin';
import HRLogin from './pages/HRLogin';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ─── Module 2: Candidate Dashboard (Sachi) ────────────────────────
import Dashboard from './pages/Dashboard';
import UploadDocuments from './pages/UploadDocuments';
import ViewDocuments from './pages/ViewDocuments';
import UpdateDocument from './pages/UpdateDocument';

// ─── Module 3: HR Dashboard (Juhi) ───────────────────────────────
import HRDashboard from './pages/HRDashboard';
import CandidatesList from './pages/CandidatesList';
import CandidateDetails from './pages/CandidateDetails';

// ─── Module 4: Reports (Srinjoy) ──────────────────────────────────
import CandidateReports from './pages/CandidateReports';

// ─── Utils ─────────────────────────────────────────────────────────
import { verifySession, clearSession } from './utils/api';

// ─── Styles ────────────────────────────────────────────────────────
import './index.css';

function App() {
  // ─── State Management ────────────────────────────────────────────
  const getInitialAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        return { auth: true, user: JSON.parse(userData) };
      } catch {
        return { auth: false, user: null };
      }
    }
    return { auth: false, user: null };
  };

  const initial = getInitialAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(initial.auth);
  const [user, setUser] = useState(initial.user);
  const [loading, setLoading] = useState(false);

  // ─── Session Verification ────────────────────────────────────────
  useEffect(() => {
    // Verify token with backend once per hour silently
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const lastVerified = localStorage.getItem('lastVerified');
    const oneHour = 60 * 60 * 1000;
    const shouldVerify = !lastVerified || (Date.now() - parseInt(lastVerified)) > oneHour;

    if (shouldVerify) {
      verifySession().then(valid => {
        if (valid) {
          localStorage.setItem('lastVerified', Date.now().toString());
          // Check if user needs to change password
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              if (parsedUser.isFirstLogin === true) {
                console.log('⚠️ User needs to change password - redirecting...');
                const role = parsedUser.role || 'candidate';
                window.location.href = `/${role}/change-password`;
                setLoading(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing user data:', e);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // ─── Logout Handler ──────────────────────────────────────────────
  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('lastVerified');
    window.location.href = '/candidate/login';
  };

  // ─── Auth Check Helper ───────────────────────────────────────────
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

  // ─── Loading Screen ──────────────────────────────────────────────
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

  // ─── App Routes ──────────────────────────────────────────────────
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={
            isAuthenticated
              ? <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/candidate/dashboard'} replace />
              : <Navigate to="/candidate/login" replace />
          } />

          {/* ── Module 1: Authentication Routes ── */}
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/hr/login" element={<HRLogin />} />
          
          {/* Forgot Password */}
          <Route path="/candidate/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/hr/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Reset Password */}
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/candidate/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/hr/reset-password/:token" element={<ResetPasswordPage />} />
          
          {/* Change Password */}
          <Route path="/candidate/change-password" element={<ChangePasswordPage />} />
          <Route path="/hr/change-password" element={<ChangePasswordPage />} />

          {/* ── Module 2: Candidate Routes (Sachi) ── */}
          <Route
            path="/candidate/dashboard"
            element={requireAuth(<Dashboard user={user} onLogout={handleLogout} />, 'candidate')}
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
            path="/update/:documentId"
            element={requireAuth(<UpdateDocument user={user} />, 'candidate')}
          />

          {/* ── Module 3: HR Routes (Juhi) ── */}
          <Route
            path="/hr/dashboard"
            element={requireAuth(<HRDashboard user={user} onLogout={handleLogout} />, 'hr')}
          />
          <Route
            path="/candidates-list"
            element={requireAuth(<CandidatesList user={user} />, 'hr')}
          />
          <Route
            path="/candidate-details/:id"
            element={requireAuth(<CandidateDetails user={user} />, 'hr')}
          />

          {/* ── Module 4: Report Routes (Srinjoy) ── */}
          <Route
            path="/reports"
            element={requireAuth(<CandidateReports user={user} onLogout={handleLogout} />, 'candidate')}
          />

          {/* ── Profile Route ── */}
          <Route
            path="/profile"
            element={requireAuth(<div>Profile Page - Coming Soon</div>)}
          />

          {/* ── Catch All Route ── */}
          <Route path="*" element={<Navigate to="/candidate/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;