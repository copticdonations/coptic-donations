const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { uploadPhoto } = require('../middleware/upload');

const STATUS_ORDER = ['received', 'processing', 'shipped', 'delivered', 'installed'];

router.post('/:id/status', (req, res) => {
  const { status, message } = req.body;
  const donationId = parseInt(req.params.id);

  if (!STATUS_ORDER.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${STATUS_ORDER.join(', ')}` });
  }

  const donation = db.prepare('SELECT id FROM donations WHERE id = ?').get([donationId]);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const latest = db.prepare(
    'SELECT status FROM status_updates WHERE donation_id = ? ORDER BY timestamp DESC LIMIT 1'
  ).get([donationId]);

  if (latest) {
    const currentIndex = STATUS_ORDER.indexOf(latest.status);
    const newIndex = STATUS_ORDER.indexOf(status);
    if (newIndex <= currentIndex) {
      return res.status(400).json({ error: `Cannot move status backwards. Current: ${latest.status}` });
    }
  }

  db.prepare('INSERT INTO status_updates (donation_id, status, message) VALUES (?, ?, ?)').run(
    [donationId, status, message || null]
  );

  res.json({ message: 'Status updated successfully' });
});

router.post('/:id/installation-photo', uploadPhoto.single('photo'), (req, res) => {
  const donationId = parseInt(req.params.id);
  if (!req.file) return res.status(400).json({ error: 'No photo uploaded' });

  const donation = db.prepare('SELECT id FROM donations WHERE id = ?').get([donationId]);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const photo_url = `/uploads/installations/${req.file.filename}`;
  db.prepare('UPDATE donations SET installation_photo_url = ? WHERE id = ?').run([photo_url, donationId]);

  res.json({ photo_url });
});

module.exports = router;
