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

// ============ SRINJOY'S AUTH MODULE ROUTES ============
app.use('/api/auth', require('./routes/authRoutes'));

// ============ YOUR DOCUMENT MODULE ROUTES ============
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'VeriFlow BGV System API',
    version: '1.0',
    modules: ['Authentication', 'Document Management'],
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      history: '/api/history'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;