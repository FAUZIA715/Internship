import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import HRDashboard from './components/HRDashboard';
import UploadDocuments from './components/UploadDocuments';
import ViewDocuments from './components/ViewDocuments';
import UpdateDocument from './components/UpdateDocument';
import Login from './components/Login';
import './App.css';

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
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const getDashboardComponent = () => {
    if (user?.role === 'hr') return HRDashboard;
    return Dashboard;
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <DashboardComponent user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/upload" 
            element={isAuthenticated && user?.role === 'candidate' ? <UploadDocuments user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/documents" 
            element={isAuthenticated ? <ViewDocuments user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/update/:documentId" 
            element={isAuthenticated && user?.role === 'candidate' ? <UpdateDocument user={user} /> : <Navigate to="/documents" />} 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;