require('dotenv').config();
const express = require('express');
const cors = require('cors');
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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));

// ─── Module 2: Document Management (Sachi) ───────────────────────
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// ─── Module 3: HR Dashboard (Juhi) ───────────────────────────────
app.use('/api/hr', require('./routes/hrRoutes'));

// ─── Module 4: Report Generation (Srinjoy) ───────────────────────
app.use('/api/reports', require('./routes/reportRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'VeriFlow BGV System API running',
    status: 'OK',
    version: '1.0',
    modules: {
      'Module 1 - Authentication': '/api/auth',
      'Module 2 - Document Management': '/api/documents',
      'Module 3 - HR Dashboard': '/api/hr',
      'Module 4 - Report Generation': '/api/reports'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
