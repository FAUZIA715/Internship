import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
    window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
  };

  const getDashboardComponent = () => {
    if (user?.role === 'hr') return HRDashboard;
    return Dashboard;
  };

  const DashboardComponent = getDashboardComponent();

  // Show loading state
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

  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Document Module Routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <DashboardComponent user={user} onLogout={handleLogout} />
              ) : (
                (() => {
                  window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
                  return null;
                })()
              )
            } 
          />
          <Route 
            path="/upload" 
            element={
              isAuthenticated && user?.role === 'candidate' ? (
                <UploadDocuments user={user} />
              ) : (
                (() => {
                  window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
                  return null;
                })()
              )
            } 
          />
          <Route 
            path="/documents" 
            element={
              isAuthenticated ? (
                <ViewDocuments user={user} onLogout={handleLogout} />
              ) : (
                (() => {
                  window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
                  return null;
                })()
              )
            } 
          />
          <Route 
            path="/verification-status" 
            element={
              isAuthenticated ? (
                <UpdateDocument user={user} onLogout={handleLogout} />
              ) : (
                (() => {
                  window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
                  return null;
                })()
              )
            } 
          />
          <Route 
            path="/update/:documentId" 
            element={
              isAuthenticated && user?.role === 'candidate' ? (
                <UpdateDocument user={user} />
              ) : (
                (() => {
                  window.location.href = `${AUTH_SERVER_URL}/candidate/login`;
                  return null;
                })()
              )
            } 
          />
          
          {/* HR Routes */}
          <Route 
            path="/hr/dashboard" 
            element={
              isAuthenticated && user?.role === 'hr' ? (
                <HRDashboard user={user} onLogout={handleLogout} />
              ) : (
                (() => {
                  window.location.href = `${AUTH_SERVER_URL}/hr/login`;
                  return null;
                })()
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;