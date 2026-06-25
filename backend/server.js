require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// ─── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ─── Rate Limiting ────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per 15 minutes
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute
  message: { success: false, message: 'Too many requests. Please slow down.' }
});

// ─── Middleware ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limit to all API routes
app.use('/api/', apiLimiter);

// Serve uploaded files and reports
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ─── Routes ───────────────────────────────────────────────────────

// Module 1: Authentication (Srinjoy) — with login rate limit
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);

// Module 2: Document Management (Sachi)
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));

// Module 3: HR Dashboard (Juhi)
app.use('/api/hr', require('./routes/hrRoutes'));

// Module 4: Report Generation (Srinjoy)
app.use('/api/reports', require('./routes/reportRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'VeriFlow BGV System API',
    version: '1.0',
    status: 'running'
  });
});

// ─── Auto-delete rejected candidates after 10 days ───────────────
cron.schedule('0 0 * * *', async () => {
  try {
    const User = require('./models/User');
    const Document = require('./models/document');
    const History = require('./models/History');
    const Report = require('./models/Report');
    const fs = require('fs');

    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const candidates = await User.find({ role: 'candidate' });

    for (const candidate of candidates) {
      const docs = await Document.find({ candidateId: candidate._id });
      const requiredTypes = ['aadhaar', 'pan', 'degree', 'employment'];
      const requiredDocs = docs.filter(d => requiredTypes.includes(d.documentType));

      if (requiredDocs.length === 0) continue;
      if (!requiredDocs.every(d => d.status === 'rejected')) continue;

      const mostRecentUpdate = requiredDocs.reduce((latest, doc) => {
        const updated = new Date(doc.updatedAt);
        return updated > latest ? updated : latest;
      }, new Date(0));

      if (mostRecentUpdate > tenDaysAgo) continue;

      const reports = await Report.find({ candidateId: candidate._id });
      for (const report of reports) {
        if (report.filePath && fs.existsSync(report.filePath)) {
          fs.unlinkSync(report.filePath);
        }
      }

      await Report.deleteMany({ candidateId: candidate._id });
      await History.deleteMany({ candidateId: candidate._id });
      await Document.deleteMany({ candidateId: candidate._id });
      await User.deleteOne({ _id: candidate._id });

      console.log(`🗑️ Auto-deleted rejected candidate: ${candidate.name} (${candidate.email})`);
    }
  } catch (err) {
    console.error('Auto-delete cron error:', err.message);
  }
});

// ─── Global error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS error: origin not allowed' });
  }
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`📄 Reports directory: ${path.join(__dirname, 'reports')}`);
});

module.exports = app;
