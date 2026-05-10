const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/:code', (req, res) => {
  const donation = db.prepare(`
    SELECT d.id, d.tracking_code, d.donor_name, d.donor_email, d.donor_phone, d.anonymous,
           d.tax_receipt_requested, d.purchase_date, d.purchase_location,
           d.receipt_image_url, d.receipt_uploaded_at,
           d.installation_photo_url, d.created_at, d.commitment_details,
           i.title as item_title, i.image_url as item_image_url,
           i.tax_receipt as item_tax_receipt, i.cost as item_cost,
           i.cost_max as item_cost_max, i.link as item_link,
           i.payment_method, i.payment_instructions,
           i.service_benefiting, i.category
    FROM donations d
    JOIN items i ON i.id = d.item_id
    WHERE d.tracking_code = ?
  `).get([req.params.code]);

  if (!donation) return res.status(404).json({ error: 'Tracking code not found' });

  const images = db.prepare(
    'SELECT image_url FROM item_images WHERE item_id = (SELECT item_id FROM donations WHERE id = ?) ORDER BY sort_order ASC, id ASC LIMIT 1'
  ).get([donation.id]);
  if (images) donation.item_image_url = images.image_url;

  const status_updates = db.prepare(
    'SELECT id, status, message, timestamp FROM status_updates WHERE donation_id = ? ORDER BY timestamp ASC'
  ).all([donation.id]);

  res.json({ donation, status_updates });
});

module.exports = router;
