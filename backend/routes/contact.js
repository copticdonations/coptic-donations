const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', (req, res) => {
  const { name, email, type, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  db.prepare(
    'INSERT INTO tickets (name, email, type, subject, message) VALUES (?, ?, ?, ?, ?)'
  ).run([name, email, type || 'general', subject || null, message]);

  res.json({ message: 'Message received. We will be in touch soon.' });
});

module.exports = router;
