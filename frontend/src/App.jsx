import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
import CandidateLogin from './pages/CandidateLogin';
import HRLogin from './pages/HRLogin';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ─── Module 2: Candidate Dashboard (Sachi) ───────────────────────
import Dashboard from './pages/Dashboard';
import UploadDocuments from './pages/UploadDocuments';
import ViewDocuments from './pages/ViewDocuments';
import UpdateDocument from './pages/UpdateDocument';

// ─── Module 3: HR Dashboard (Juhi) ───────────────────────────────
import HRDashboard from './pages/HRDashboard';
import CandidatesList from './pages/CandidatesList';
import CandidateDetails from './pages/CandidateDetails';

// ─── Module 4: Reports (Srinjoy) ─────────────────────────────────
import CandidateReports from './pages/CandidateReports';

// ─── Utils ───────────────────────────────────────────────────────
import { verifySession, clearSession } from './utils/api';
import './index.css';

// ─── Read auth state synchronously before first render ───────────
const getInitialAuth = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  if (token && userData) {
    try { return { auth: true, user: JSON.parse(userData) }; }
    catch { return { auth: false, user: null }; }
  }
  return { auth: false, user: null };
};

const initialAuth = getInitialAuth();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.auth);
  const [user, setUser] = useState(initialAuth.user);

  // ─── Verify session silently once per hour ────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const lastVerified = localStorage.getItem('lastVerified');
    const oneHour = 60 * 60 * 1000;
    const shouldVerify = !lastVerified || (Date.now() - parseInt(lastVerified)) > oneHour;

    if (shouldVerify) {
      verifySession().then(valid => {
        if (valid) {
          localStorage.setItem('lastVerified', Date.now().toString());
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const parsedUser = JSON.parse(userData);
              if (parsedUser.isFirstLogin === true) {
                const role = parsedUser.role || 'candidate';
                window.location.href = `/${role}/change-password`;
              }
            } catch { }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          clearSession();
        }
      });
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────────
  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/candidate/login';
  };

  // ─── Auth guard ───────────────────────────────────────────────
  const requireAuth = (component, role = null) => {
    if (!isAuthenticated) {
      return <Navigate to={role === 'hr' ? '/hr/login' : '/candidate/login'} replace />;
    }
    if (role && user?.role !== role) {
      return <Navigate to={role === 'hr' ? '/hr/login' : '/candidate/login'} replace />;
    }
    return component;
  };

  return (
    <Router>
      <Routes>

        {/* Default redirect */}
        <Route path="/" element={
          isAuthenticated
            ? <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/candidate/dashboard'} replace />
            : <Navigate to="/candidate/login" replace />
        } />

        {/* ── Module 1: Auth ── */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/candidate/forgot-password" element={<ForgotPasswordPage portalRole="candidate" />} />
        <Route path="/hr/forgot-password" element={<ForgotPasswordPage portalRole="hr" />} />
        <Route path="/candidate/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/hr/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/candidate/change-password" element={<ChangePasswordPage />} />
        <Route path="/hr/change-password" element={<ChangePasswordPage />} />
        <Route path="/:portalRole/change-password" element={<ChangePasswordPage />} />
        <Route path="/:portalRole/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:portalRole/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── Module 2: Candidate (Sachi) ── */}
        <Route path="/candidate/dashboard" element={requireAuth(<Dashboard user={user} onLogout={handleLogout} />, 'candidate')} />
        <Route path="/upload" element={requireAuth(<UploadDocuments user={user} />, 'candidate')} />
        <Route path="/documents" element={requireAuth(<ViewDocuments user={user} onLogout={handleLogout} />, 'candidate')} />
        <Route path="/verification-status" element={requireAuth(<UpdateDocument user={user} onLogout={handleLogout} />, 'candidate')} />
        <Route path="/update/:documentId" element={requireAuth(<UpdateDocument user={user} />, 'candidate')} />

        {/* ── Module 3: HR (Juhi) ── */}
        <Route path="/hr/dashboard" element={requireAuth(<HRDashboard user={user} onLogout={handleLogout} />, 'hr')} />
        <Route path="/candidates-list" element={requireAuth(<CandidatesList user={user} />, 'hr')} />
        <Route path="/candidate-details/:id" element={requireAuth(<CandidateDetails user={user} />, 'hr')} />

        {/* ── Module 4: Reports (Srinjoy) ── */}
        <Route path="/reports" element={requireAuth(<CandidateReports user={user} onLogout={handleLogout} />, 'candidate')} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
