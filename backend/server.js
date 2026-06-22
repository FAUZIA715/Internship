require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection (using connectDB instead of duplicate connection)
// The connectDB function already handles the connection

// Serve uploaded files and reports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ============ ROUTES ============

// Module 1: Authentication (Srinjoy)
app.use('/api/auth', require('./routes/authRoutes'));

// Module 2: Document Management (Sachi)
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Module 3: HR Dashboard (Juhi)
app.use('/api/hr', require('./routes/hrRoutes'));

// Module 4: Report Generation (Srinjoy)
app.use('/api/reports', require('./routes/reportRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint with module information
app.get('/', (req, res) => {
  res.json({
    message: 'VeriFlow BGV System API',
    version: '1.0',
    modules: {
      'Authentication': '/api/auth',
      'Document Management': '/api/documents',
      'History Tracking': '/api/history',
      'HR Dashboard': '/api/hr',
      'Report Generation': '/api/reports'
    },
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      history: '/api/history',
      hr: '/api/hr',
      reports: '/api/reports'
    },
    status: {
      server: 'running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📄 Reports directory: ${path.join(__dirname, 'reports')}`);
});

module.exports = app;