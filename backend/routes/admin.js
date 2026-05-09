const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/stats', (req, res) => {
  const { total_donations } = db.prepare('SELECT COUNT(*) as total_donations FROM donations').get([]);
  const { total_items } = db.prepare("SELECT COUNT(*) as total_items FROM items WHERE item_status != 'archived'").get([]);

  const statusRows = db.prepare(`
    SELECT status, COUNT(*) as count FROM (
      SELECT DISTINCT donation_id,
        (SELECT status FROM status_updates s2 WHERE s2.donation_id = s1.donation_id ORDER BY timestamp DESC LIMIT 1) as status
      FROM status_updates s1
    ) GROUP BY status
  `).all([]);

  const by_status = {
    commitment_received: 0,
    item_sent: 0,
    delivered: 0,
    tax_receipt_sent: 0,
    completed: 0,
  };
  for (const row of statusRows) {
    if (row.status in by_status) by_status[row.status] = row.count;
  }

  res.json({ total_donations, total_items, by_status });
});

module.exports = router;
