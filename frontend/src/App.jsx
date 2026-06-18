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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }

    const handleMessage = (event) => {
      if (event.origin !== AUTH_SERVER_URL) return;
      
      if (event.data?.type === 'LOGIN_SUCCESS') {
        const { token, user: userData } = event.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        window.location.href = '/dashboard';
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to auth branch candidate login
    window.location.href = `${AUTH_SERVER_URL}/candidate/login?redirect=${window.location.origin}`;
  };

  const getDashboardComponent = () => {
    if (user?.role === 'hr') return HRDashboard;
    return Dashboard;
  };

  const DashboardComponent = getDashboardComponent();

  // Helper function for redirects
  const redirectToLogin = (role = 'candidate') => {
    window.location.href = `${AUTH_SERVER_URL}/${role}/candidate/login?redirect=${window.location.origin}`;
    return null;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/candidate/login" element={redirectToLogin('candidate')} />
          <Route path="/hr/login" element={redirectToLogin('hr')} />                   
          {/* Document Module Routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <DashboardComponent user={user} onLogout={handleLogout} />
              ) : (
                redirectToLogin('candidate')
              )
            } 
          />
          <Route 
            path="/upload" 
            element={
              isAuthenticated && user?.role === 'candidate' ? (
                <UploadDocuments user={user} />
              ) : (
                redirectToLogin('candidate')
              )
            } 
          />
          <Route 
            path="/documents" 
            element={
              isAuthenticated ? (
                <ViewDocuments user={user} onLogout={handleLogout} />
              ) : (
                redirectToLogin('candidate')
              )
            } 
          />
          <Route 
            path="/verification-status" 
            element={
              isAuthenticated ? (
                <UpdateDocument user={user} onLogout={handleLogout} />
              ) : (
                redirectToLogin('candidate')
              )
            } 
          />
          <Route 
            path="/update/:documentId" 
            element={
              isAuthenticated && user?.role === 'candidate' ? (
                <UpdateDocument user={user} />
              ) : (
                redirectToLogin('candidate')
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
                redirectToLogin('hr')
              )
            } 
          />
          
          {/* Default redirect */}
          <Route path="/" element={redirectToLogin('candidate')} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;