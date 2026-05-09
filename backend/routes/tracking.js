const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/:code', (req, res) => {
  const donation = db.prepare(`
    SELECT d.id, d.tracking_code, d.donor_name, d.amount, d.installation_photo_url, d.created_at,
           i.title as item_title, i.image_url as item_image_url
    FROM donations d
    JOIN items i ON i.id = d.item_id
    WHERE d.tracking_code = ?
  `).get([req.params.code]);

  if (!donation) return res.status(404).json({ error: 'Tracking code not found' });

  const status_updates = db.prepare(
    'SELECT id, status, message, timestamp FROM status_updates WHERE donation_id = ? ORDER BY timestamp ASC'
  ).all([donation.id]);

  res.json({ donation, status_updates });
});

module.exports = router;
