const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');

function generateTrackingCode() {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CPT-${year}-${hex}`;
}

router.post('/', (req, res) => {
  const { item_id, donor_name, donor_email, amount } = req.body;
  if (!item_id || !donor_name || !amount) {
    return res.status(400).json({ error: 'item_id, donor_name, and amount are required' });
  }
  const item = db.prepare('SELECT id FROM items WHERE id = ?').get([item_id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  let tracking_code;
  let attempts = 0;
  do {
    tracking_code = generateTrackingCode();
    attempts++;
  } while (db.prepare('SELECT id FROM donations WHERE tracking_code = ?').get([tracking_code]) && attempts < 10);

  let donation_id;
  db.exec('BEGIN');
  try {
    const result = db.prepare(
      'INSERT INTO donations (item_id, donor_name, donor_email, amount, tracking_code) VALUES (?, ?, ?, ?, ?)'
    ).run([item_id, donor_name, donor_email || null, parseFloat(amount), tracking_code]);
    donation_id = result.lastInsertRowid;
    db.prepare(
      'INSERT INTO status_updates (donation_id, status, message) VALUES (?, ?, ?)'
    ).run([donation_id, 'received', 'Thank you for your generous donation! We have received it safely.']);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: 'Failed to record donation' });
  }

  res.status(201).json({ donation_id, tracking_code, message: 'Donation recorded. Keep your tracking code safe.' });
});

router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const { status } = req.query;

  let query = `
    SELECT d.*, i.title as item_title,
      (SELECT status FROM status_updates WHERE donation_id = d.id ORDER BY timestamp DESC LIMIT 1) as current_status
    FROM donations d
    JOIN items i ON i.id = d.item_id
  `;
  const params = [];

  if (status) {
    query += ` WHERE (SELECT status FROM status_updates WHERE donation_id = d.id ORDER BY timestamp DESC LIMIT 1) = ?`;
    params.push(status);
  }

  query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const donations = db.prepare(query).all(params);

  let countQuery = `SELECT COUNT(*) as total FROM donations d`;
  const countParams = [];
  if (status) {
    countQuery += ` WHERE (SELECT status FROM status_updates WHERE donation_id = d.id ORDER BY timestamp DESC LIMIT 1) = ?`;
    countParams.push(status);
  }
  const { total } = db.prepare(countQuery).get(countParams);

  res.json({ donations, total, page, limit });
});

module.exports = router;
