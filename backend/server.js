const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const hrRoutes = require('./routes/hrRoutes');
app.use('/api/hr', hrRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'HR Dashboard API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});