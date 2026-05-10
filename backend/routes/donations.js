const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');
const { sendMail } = require('../lib/mailer');

function generateTrackingCode() {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CPT-${year}-${hex}`;
}

router.post('/', (req, res) => {
  const { item_id, donor_name, donor_email, donor_phone, tax_receipt_requested, anonymous } = req.body;
  if (!item_id || !donor_name) {
    return res.status(400).json({ error: 'item_id and donor_name are required' });
  }
  const item = db.prepare('SELECT id, title FROM items WHERE id = ?').get([item_id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  let tracking_code;
  let attempts = 0;
  do {
    tracking_code = generateTrackingCode();
    attempts++;
  } while (db.prepare('SELECT id FROM donations WHERE tracking_code = ?').get([tracking_code]) && attempts < 10);

  let donation_id;

  // Donation insert — its own immediate transaction
  try {
    db.exec('BEGIN IMMEDIATE');
    const result = db.prepare(
      `INSERT INTO donations (item_id, donor_name, donor_email, donor_phone, tracking_code, tax_receipt_requested, anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run([
      item_id,
      donor_name,
      donor_email || null,
      donor_phone || null,
      tracking_code,
      tax_receipt_requested ? 1 : 0,
      anonymous ? 1 : 0,
    ]);
    donation_id = result.lastInsertRowid;
    db.exec('COMMIT');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    console.error('Donation insert failed:', err.message);
    return res.status(500).json({ error: 'Failed to record commitment' });
  }

  // Status update — separate, non-fatal (table may have old schema)
  try {
    db.prepare(
      'INSERT INTO status_updates (donation_id, status, message) VALUES (?, ?, ?)'
    ).run([donation_id, 'commitment_received', 'Thank you for your commitment! We will be in touch as we move forward.']);
  } catch (statusErr) {
    console.warn('Status update failed (non-fatal):', statusErr.message);
  }

  // Email notification — non-fatal
  sendMail({
    subject: `New Commitment: ${item.title}`,
    text: [
      `New commitment received for: ${item.title}`,
      `Tracking code: ${tracking_code}`,
      `Name: ${donor_name}`,
      `Email: ${donor_email || 'N/A'}`,
      `Phone: ${donor_phone || 'N/A'}`,
      `Tax receipt requested: ${tax_receipt_requested ? 'Yes' : 'No'}`,
    ].join('\n'),
    html: `
      <h2>New Commitment Received</h2>
      <p><strong>Item:</strong> ${item.title}</p>
      <p><strong>Tracking Code:</strong> ${tracking_code}</p>
      <p><strong>Name:</strong> ${donor_name}</p>
      <p><strong>Email:</strong> ${donor_email ? `<a href="mailto:${donor_email}">${donor_email}</a>` : 'N/A'}</p>
      <p><strong>Phone:</strong> ${donor_phone || 'N/A'}</p>
      <p><strong>Tax Receipt Requested:</strong> ${tax_receipt_requested ? 'Yes' : 'No'}</p>
    `,
  }).catch(err => console.error('Commitment email failed:', err.message));

  res.status(201).json({ donation_id, tracking_code, message: 'Commitment recorded. Keep your tracking code safe.' });
});

router.get('/:id', (req, res) => {
  const donation = db.prepare(`
    SELECT d.*, i.title as item_title, i.image_url as item_image_url,
           i.cost as item_cost, i.tax_receipt as item_tax_receipt
    FROM donations d
    JOIN items i ON i.id = d.item_id
    WHERE d.id = ?
  `).get([req.params.id]);

  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const status_updates = db.prepare(
    'SELECT id, status, message, timestamp FROM status_updates WHERE donation_id = ? ORDER BY timestamp ASC'
  ).all([donation.id]);

  const images = db.prepare(
    'SELECT image_url FROM item_images WHERE item_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1'
  ).get([donation.item_id]);
  if (images) donation.item_image_url = images.image_url;

  res.json({ donation, status_updates });
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
  const { total } = db.prepare(countQuery).get(countParams.length ? countParams : []);

  res.json({ donations, total, page, limit });
});

module.exports = router;
