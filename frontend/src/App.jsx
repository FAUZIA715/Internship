import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HRDashboard from './pages/HRDashboard';
import CandidatesList from './pages/CandidatesList';
import CandidateDetails from './pages/CandidateDetails';

import { verifySession, clearSession } from './utils/api';

// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
import CandidateLogin from './pages/CandidateLogin';
import HRLogin from './pages/HRLogin';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// ─── Module 5.1: Candidate Dashboard (Sachi) ─────────────────────
import Dashboard from './pages/Dashboard';
import UploadDocuments from './pages/UploadDocuments';
import ViewDocuments from './pages/ViewDocuments';
import UpdateDocument from './pages/UpdateDocument';


function App() {
  const getInitialAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try { return { auth: true, user: JSON.parse(userData) }; } catch { return { auth: false, user: null }; }
    }
    return { auth: false, user: null };
  };

  const initial = getInitialAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(initial.auth);
  const [user, setUser] = useState(initial.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verify token with backend once per hour silently
    const token = localStorage.getItem('token');
    if (!token) return;

    const lastVerified = localStorage.getItem('lastVerified');
    const oneHour = 60 * 60 * 1000;
    const shouldVerify = !lastVerified || (Date.now() - parseInt(lastVerified)) > oneHour;

    if (shouldVerify) {
      verifySession().then(valid => {
        if (valid) {
          localStorage.setItem('lastVerified', Date.now().toString());
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      });
    }
  }, []);

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/candidate/login';
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HRDashboard />} />
        <Route path="/hr-dashboard" element={<HRDashboard />} />
        <Route path="/candidates-list" element={<CandidatesList />} />
        <Route path="/candidate-details/:id" element={<CandidateDetails />} />

      
        {/* Default redirect */}
        <Route
          path="/"
          element={
            !isAuthenticated
              ? <Navigate to="/candidate/login" replace />
              : user?.role === 'hr'
                ? <Navigate to="/hr/dashboard" replace />
                : <Navigate to="/candidate/dashboard" replace />
          }
        />

        {/* ── Module 1: Auth Pages (Srinjoy) ── */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/:portalRole/change-password" element={<ChangePasswordPage />} />
        <Route path="/:portalRole/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/:portalRole/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── Module 5.1: Candidate Dashboard (Sachi) ── */}
        <Route path="/candidate/dashboard" element={
          !isAuthenticated ? <Navigate to="/candidate/login" replace />
            : user?.role !== 'candidate' ? <Navigate to="/hr/login" replace />
              : <Dashboard user={user} onLogout={handleLogout} />
        } />
        <Route path="/upload" element={
          !isAuthenticated ? <Navigate to="/candidate/login" replace />
            : <UploadDocuments user={user} />
        } />
        <Route path="/documents" element={
          !isAuthenticated ? <Navigate to="/candidate/login" replace />
            : <ViewDocuments user={user} onLogout={handleLogout} />
        } />
        <Route path="/verification-status" element={
          !isAuthenticated ? <Navigate to="/candidate/login" replace />
            : <UpdateDocument user={user} onLogout={handleLogout} />
        } />
        <Route path="/update/:documentId" element={
          !isAuthenticated ? <Navigate to="/candidate/login" replace />
            : <UpdateDocument user={user} />
        } />

        {/* ── Module 5.2: HR Dashboard (Juhi) ── */}
        <Route path="/hr/dashboard" element={
          !isAuthenticated ? <Navigate to="/hr/login" replace />
            : user?.role !== 'hr' ? <Navigate to="/candidate/login" replace />
              : <HRDashboard user={user} onLogout={handleLogout} />
        } />
        <Route path="/candidates-list" element={
          !isAuthenticated ? <Navigate to="/hr/login" replace />
            : <CandidatesList user={user} />
        } />
        <Route path="/candidate-details/:id" element={
          !isAuthenticated ? <Navigate to="/hr/login" replace />
            : <CandidateDetails user={user} />
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
