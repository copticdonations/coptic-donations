const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { sendMail } = require('../lib/mailer');

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM connections ORDER BY created_at DESC'
  ).all([]);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, email, phone, offer_type, description, item_id } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  db.prepare(
    'INSERT INTO connections (name, email, phone, offer_type, description, item_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run([name, email, phone || null, offer_type || null, description || null, item_id || null]);

  sendMail({
    to: 'copticdonations7@gmail.com',
    subject: `New Get Connected submission from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'N/A'}`,
      `Offer type: ${offer_type || 'N/A'}`,
      `Description: ${description || 'N/A'}`,
    ].join('\n'),
    html: `
      <h2>New Get Connected Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Offer type:</strong> ${offer_type || 'N/A'}</p>
      <p><strong>Description:</strong> ${description || 'N/A'}</p>
    `,
  }).catch(err => console.error('Get Connected email failed:', err.message));

  res.json({ message: 'Thank you! We will be in touch.' });
});

module.exports = router;
