const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' }).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
