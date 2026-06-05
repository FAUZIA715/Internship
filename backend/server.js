require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/documents', require('./routes/documentRoutes'));

// Simple auth endpoint (for frontend demo)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Demo credentials
  if (email === 'candidate@veriflow.com' && password === 'cand123') {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: 'candidate123', role: 'candidate', name: 'John Candidate' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      token,
      user: { id: 'candidate123', email, role: 'candidate', name: 'John Candidate' }
    });
  }
  
  if (email === 'admin@veriflow.com' && password === 'admin123') {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: 'admin123', role: 'admin', name: 'Administrator' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    return res.json({
      success: true,
      token,
      user: { id: 'admin123', email, role: 'admin', name: 'Administrator' }
    });
  }
  
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Document Management API',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/documents/upload',
      list: 'GET /api/documents',
      download: 'GET /api/documents/download/:id',
      update: 'PUT /api/documents/:id',
      delete: 'DELETE /api/documents/:id',
      verify: 'PUT /api/documents/:id/verify (Admin)'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
});