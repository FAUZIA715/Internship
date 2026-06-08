const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const candidateRoutes = require('./routes/candidateRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // NEW

require('dotenv').config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/candidates', candidateRoutes);
app.use('/api/notifications', notificationRoutes); // NEW

app.get('/', (req, res) => {
  res.json({ message: 'BGV System API running', status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});