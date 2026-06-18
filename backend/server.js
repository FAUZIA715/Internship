require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to shared database - bgv_system
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'bgv_system'
})
.then(() => {
  console.log('✅ Connected to bgv_system database');
})
.catch(err => console.log('❌ MongoDB error:', err.message));

app.use('/api/hr', require('./routes/hrRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'VeriFlow API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});