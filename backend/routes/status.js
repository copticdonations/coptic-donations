const express = require('express');
const router = express.Router();
const db = require('../db/database');
const fs = require('fs');
const path = require('path');
const { uploadPhoto, uploadReceipt } = require('../middleware/upload');
const { sendMail } = require('../lib/mailer');

const STATUS_ORDER = ['commitment_received', 'item_sent', 'delivered', 'tax_receipt_sent', 'completed'];

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

router.post('/:id/receipt', uploadReceipt.single('receipt'), (req, res) => {
  const donationId = parseInt(req.params.id);
  if (!req.file) return res.status(400).json({ error: 'No receipt uploaded' });

  const donation = db.prepare(`
    SELECT d.*, i.title as item_title, i.treasurer_email, i.id as item_id
    FROM donations d JOIN items i ON i.id = d.item_id WHERE d.id = ?
  `).get([donationId]);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const receipt_url = `/uploads/receipts/${req.file.filename}`;
  const { purchase_date, purchase_location } = req.body;
  const uploadedAt = new Date().toISOString();

  db.prepare(
    'UPDATE donations SET receipt_image_url = ?, receipt_uploaded_at = ?, purchase_date = COALESCE(?, purchase_date), purchase_location = COALESCE(?, purchase_location) WHERE id = ?'
  ).run([receipt_url, uploadedAt, purchase_date || null, purchase_location || null, donationId]);

  // Send receipt email to treasurer + coordinator
  try {
    const filePath = path.join(__dirname, '..', 'uploads', 'receipts', req.file.filename);
    const fileBase64 = fs.readFileSync(filePath).toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const attachment = { base64: fileBase64, mimeType, filename: req.file.filename };

    const html = `
      <h2>Receipt Uploaded — ${donation.item_title}</h2>
      <p><strong>Donor:</strong> ${donation.donor_name}</p>
      <p><strong>Email:</strong> ${donation.donor_email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${donation.donor_phone || 'N/A'}</p>
      <p><strong>Tracking Code:</strong> ${donation.tracking_code}</p>
      <p><strong>Uploaded At:</strong> ${new Date(uploadedAt).toLocaleString()}</p>
      <p>The receipt is attached to this email.</p>
    `;

    const recipients = ['copticdonations7@gmail.com'];
    if (donation.treasurer_email) recipients.push(donation.treasurer_email);

    for (const to of recipients) {
      sendMail({
        to,
        subject: `Receipt Uploaded: ${donation.item_title} — ${donation.tracking_code}`,
        text: `Receipt uploaded for ${donation.item_title} by ${donation.donor_name}.`,
        html,
        attachments: [attachment],
      }).catch(err => console.error(`Receipt email to ${to} failed:`, err.message));
    }
  } catch (err) {
    console.error('Receipt email prep failed:', err.message);
  }

  res.json({ receipt_url });
});

module.exports = router;
