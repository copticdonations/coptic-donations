const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', (req, res) => {
  const { email, name, frequency } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    db.prepare(
      "INSERT OR IGNORE INTO newsletter_subscribers (email, name, frequency) VALUES (?, ?, ?)"
    ).run([email.toLowerCase().trim(), name || null, frequency || 'new_items']);
    res.json({ message: 'Subscribed successfully' });
  } catch (e) {
    res.status(500).json({ error: 'Could not subscribe' });
  }
});

module.exports = router;
