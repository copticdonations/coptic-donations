const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.post('/', (req, res) => {
  const { name, email, phone, offer_type, description, item_id } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  db.prepare(
    'INSERT INTO connections (name, email, phone, offer_type, description, item_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run([name, email, phone || null, offer_type || null, description || null, item_id || null]);

  res.json({ message: 'Thank you! We will be in touch.' });
});

module.exports = router;
