const express = require('express');
const router = express.Router();

// Store notification history (in memory for demo)
let notificationHistory = [];

// POST - Send email notification
router.post('/send', (req, res) => {
  const { email, fullName, subject, message } = req.body;
  
  console.log('\n=========================================');
  console.log('📧 EMAIL SENT (Demo Mode)');
  console.log('=========================================');
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Message: ${message}`);
  console.log('=========================================\n');
  
  // Save to history
  const notification = {
    id: Date.now(),
    email,
    fullName,
    subject,
    message,
    sentAt: new Date().toISOString()
  };
  notificationHistory.unshift(notification);
  
  res.json({
    success: true,
    message: `Email sent to ${fullName}`,
    notification
  });
});

// GET - Get all notification history
router.get('/history', (req, res) => {
  res.json(notificationHistory);
});

// GET - Get notification history by email
router.get('/history/:email', (req, res) => {
  const history = notificationHistory.filter(n => n.email === req.params.email);
  res.json(history);
});

module.exports = router;