import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import HRDashboard from './pages/HRDashboard.jsx';
import UploadDocuments from './pages/UploadDocuments.jsx';
import ViewDocuments from './pages/ViewDocuments.jsx';
import UpdateDocument from './pages/UpdateDocument.jsx';
import './index.css';

const AUTH_SERVER_URL = 'http://localhost:5173';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
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

  // Helper — redirect to auth server if not authenticated
  const requireAuth = (component, role = null) => {
    if (!isAuthenticated) {
      window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
      return null;
    }
    if (role && user?.role !== role) {
      window.location.href = role === 'hr'
        ? `${AUTH_SERVER_URL}/hr/login`
        : `${AUTH_SERVER_URL}/candidate/login`;
      return null;
    }
    return component;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>

          {/* Default redirect based on role */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/candidate/dashboard'} />
                : (() => {
                    window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
                    return null;
                  })()
            }
          />

          {/* Candidate Routes (Module 5.1 — Sachi) */}
          <Route
            path="/candidate/dashboard"
            element={requireAuth(<DashboardComponent user={user} onLogout={handleLogout} />)}
          />
          <Route
            path="/upload"
            element={requireAuth(<UploadDocuments user={user} />, 'candidate')}
          />
          <Route
            path="/documents"
            element={requireAuth(<ViewDocuments user={user} onLogout={handleLogout} />)}
          />
          <Route
            path="/verification-status"
            element={requireAuth(<UpdateDocument user={user} onLogout={handleLogout} />)}
          />
          <Route
            path="/update/:documentId"
            element={requireAuth(<UpdateDocument user={user} />, 'candidate')}
          />

          {/* HR Routes (Module 5.2 — Juhi) */}
          <Route
            path="/hr/dashboard"
            element={requireAuth(<HRDashboard user={user} onLogout={handleLogout} />, 'hr')}
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;