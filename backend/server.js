const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const hrRoutes = require('./routes/hrRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { protect, authorize } = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection using shared database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected (Shared Database)'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

// Routes
app.use('/api/hr', hrRoutes);
app.use('/api/reports', reportRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'HR + Report API is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});