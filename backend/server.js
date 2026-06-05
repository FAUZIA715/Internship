const express = require('express');
const cors = require('cors');
const path = require('path');  // ← Make sure this line exists
const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');

require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ========== ADD THIS LINE ==========
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// ===================================

// Routes
app.use('/api/candidates', candidateRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'BGV System API running', status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});