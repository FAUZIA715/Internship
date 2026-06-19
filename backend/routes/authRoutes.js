const express = require('express');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password, portalRole } = req.body;
    
    // Return a test token (replace with real auth later)
    res.json({
      success: true,
      token: 'test-token-12345',
      isFirstLogin: false,
      user: {
        id: '1',
        name: 'HR User',
        email: email || 'hr@example.com',
        role: portalRole || 'hr'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;