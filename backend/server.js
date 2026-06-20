require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'bgv_system'
})
.then(() => console.log('✅ Connected to bgv_system'))
.catch(err => console.log('❌ MongoDB error:', err.message));

// Routes
app.use('/api/hr', require('./routes/hrRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'VeriFlow API running' });
});
// Serve generated report PDFs statically
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ─── Module 1: Authentication (Srinjoy) ──────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));

// ─── Module 4: Report Generation (Srinjoy) ───────────────────────
app.use('/api/reports', require('./routes/reportRoutes'));


// ─── Module 2: Document Management (Sachi) ───────────────────────
// Sachi: uncomment and add your routes here after merge
// const documentRoutes = require('./routes/documentRoutes');
// app.use('/api/documents', documentRoutes);

// ─── Module 3: Document Verification + HR Dashboard (Juhi) ───────
// Juhi: uncomment and add your routes here after merge
// const hrRoutes = require('./routes/hrRoutes');
// app.use('/api/hr', hrRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'VeriFlow BGV System API running',
    status: 'OK',
    version: '1.0',
    modules: {
      'Module 1 - Authentication': '/api/auth',
      'Module 4 - Report Generation': '/api/reports',
      'Module 2 - Document Management': '/api/documents (Sachi)',
      'Module 3 - HR Dashboard': '/api/hr (Juhi)'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
