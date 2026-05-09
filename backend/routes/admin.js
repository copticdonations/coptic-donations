const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/stats', (req, res) => {
  const { total_donations } = db.prepare('SELECT COUNT(*) as total_donations FROM donations').get();
  const { total_raised } = db.prepare('SELECT COALESCE(SUM(amount), 0) as total_raised FROM donations').get();

  const statusRows = db.prepare(`
    SELECT status, COUNT(*) as count FROM (
      SELECT DISTINCT donation_id,
        (SELECT status FROM status_updates s2 WHERE s2.donation_id = s1.donation_id ORDER BY timestamp DESC LIMIT 1) as status
      FROM status_updates s1
    ) GROUP BY status
  `).all();

  const by_status = { received: 0, processing: 0, shipped: 0, delivered: 0, installed: 0 };
  for (const row of statusRows) {
    if (row.status in by_status) by_status[row.status] = row.count;
  }

  res.json({ total_donations, total_raised, by_status });
});

module.exports = router;
