const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { uploadItem } = require('../middleware/upload');

function buildSortClause(sort) {
  switch (sort) {
    case 'cost_asc': return 'ORDER BY cost ASC';
    case 'cost_desc': return 'ORDER BY cost DESC';
    case 'need_by_date': return "ORDER BY CASE WHEN need_by_date IS NULL THEN 1 ELSE 0 END, need_by_date ASC";
    default: return 'ORDER BY created_at DESC';
  }
}

router.get('/', (req, res) => {
  const { category, sort } = req.query;
  const sortClause = buildSortClause(sort);
  let items;
  if (category) {
    items = db.prepare(`SELECT * FROM items WHERE category = ? AND item_status != 'archived' ${sortClause}`).all([category]);
  } else {
    items = db.prepare(`SELECT * FROM items WHERE item_status != 'archived' ${sortClause}`).all([]);
  }

  const imageMap = {};
  const allImages = db.prepare('SELECT item_id, image_url, sort_order FROM item_images ORDER BY sort_order ASC, id ASC').all([]);
  for (const img of allImages) {
    if (!imageMap[img.item_id]) imageMap[img.item_id] = [];
    imageMap[img.item_id].push(img.image_url);
  }

  for (const item of items) {
    item.images = imageMap[item.id] || [];
    item.primary_image = item.images[0] || item.image_url || null;
  }

  res.json({ items });
});

router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get([req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const images = db.prepare('SELECT image_url, sort_order FROM item_images WHERE item_id = ? ORDER BY sort_order ASC, id ASC').all([item.id]);
  item.images = images.map(i => i.image_url);
  item.primary_image = item.images[0] || item.image_url || null;

  const phases = db.prepare('SELECT phase_label, quantity, target_date FROM item_phases WHERE item_id = ? ORDER BY id ASC').all([item.id]);
  item.phases = phases;

  res.json({ item });
});

router.get('/:id/images', (req, res) => {
  const item = db.prepare('SELECT id FROM items WHERE id = ?').get([req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const images = db.prepare('SELECT id, image_url, sort_order FROM item_images WHERE item_id = ? ORDER BY sort_order ASC, id ASC').all([req.params.id]);
  res.json({ images });
});

router.post('/', uploadItem.single('image'), (req, res) => {
  const { title, purpose_impact, cost, cost_max, category, service_benefiting, tax_receipt, link, need_by_date, item_status, quantity_needed } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const image_url = req.file ? `/uploads/items/${req.file.filename}` : null;
  const result = db.prepare(
    `INSERT INTO items (title, purpose_impact, cost, cost_max, category, service_benefiting, tax_receipt, link, need_by_date, item_status, quantity_needed, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run([
    title,
    purpose_impact || null,
    parseFloat(cost) || 0,
    cost_max ? parseFloat(cost_max) : null,
    category || null,
    service_benefiting || null,
    tax_receipt || 'possible',
    link || null,
    need_by_date || null,
    item_status || 'available',
    parseInt(quantity_needed) || 1,
    image_url,
  ]);

  if (image_url) {
    db.prepare('INSERT INTO item_images (item_id, image_url, sort_order) VALUES (?, ?, 0)').run([result.lastInsertRowid, image_url]);
  }

  const phases = req.body.phases ? JSON.parse(req.body.phases) : [];
  const insertPhase = db.prepare('INSERT INTO item_phases (item_id, phase_label, quantity, target_date) VALUES (?, ?, ?, ?)');
  for (const phase of phases) {
    insertPhase.run([result.lastInsertRowid, phase.label || null, phase.quantity, phase.date || null]);
  }

  res.status(201).json({ id: result.lastInsertRowid, message: 'Item created successfully' });
});

router.post('/:id/images', uploadItem.single('image'), (req, res) => {
  const item = db.prepare('SELECT id FROM items WHERE id = ?').get([req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const image_url = `/uploads/items/${req.file.filename}`;
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM item_images WHERE item_id = ?').get([req.params.id]);
  const sort_order = maxOrder.m + 1;

  db.prepare('INSERT INTO item_images (item_id, image_url, sort_order) VALUES (?, ?, ?)').run([req.params.id, image_url, sort_order]);
  res.json({ image_url, sort_order });
});

router.patch('/:id', (req, res) => {
  const item = db.prepare('SELECT id FROM items WHERE id = ?').get([req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const { title, purpose_impact, cost, cost_max, category, service_benefiting, tax_receipt, link, need_by_date, item_status, quantity_needed } = req.body;
  db.prepare(
    `UPDATE items SET title = COALESCE(?, title), purpose_impact = COALESCE(?, purpose_impact),
     cost = COALESCE(?, cost), cost_max = ?,
     category = COALESCE(?, category),
     service_benefiting = COALESCE(?, service_benefiting), tax_receipt = COALESCE(?, tax_receipt),
     link = COALESCE(?, link), need_by_date = COALESCE(?, need_by_date),
     item_status = COALESCE(?, item_status), quantity_needed = COALESCE(?, quantity_needed)
     WHERE id = ?`
  ).run([title || null, purpose_impact || null, cost ? parseFloat(cost) : null,
    cost_max ? parseFloat(cost_max) : null,
    category || null, service_benefiting || null, tax_receipt || null, link || null,
    need_by_date || null, item_status || null,
    quantity_needed ? parseInt(quantity_needed) : null, req.params.id]);

  res.json({ message: 'Item updated' });
});

// ── Image management ──────────────────────────────────────────
router.delete('/:id/images/:imageId', (req, res) => {
  db.prepare('DELETE FROM item_images WHERE id = ? AND item_id = ?').run([req.params.imageId, req.params.id]);
  res.json({ message: 'Image deleted' });
});

router.patch('/:id/images/reorder', (req, res) => {
  const { order } = req.body; // [{ id, sort_order }]
  const stmt = db.prepare('UPDATE item_images SET sort_order = ? WHERE id = ? AND item_id = ?');
  for (const { id, sort_order } of order) {
    stmt.run([sort_order, id, req.params.id]);
  }
  res.json({ message: 'Reordered' });
});

// ── Phase management ──────────────────────────────────────────
router.post('/:id/phases', (req, res) => {
  const { label, quantity, date } = req.body;
  const result = db.prepare(
    'INSERT INTO item_phases (item_id, phase_label, quantity, target_date) VALUES (?, ?, ?, ?)'
  ).run([req.params.id, label || null, parseInt(quantity) || 1, date || null]);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id/phases/:phaseId', (req, res) => {
  const { label, quantity, date } = req.body;
  db.prepare(
    'UPDATE item_phases SET phase_label = ?, quantity = ?, target_date = ? WHERE id = ? AND item_id = ?'
  ).run([label || null, parseInt(quantity) || 1, date || null, req.params.phaseId, req.params.id]);
  res.json({ message: 'Phase updated' });
});

router.delete('/:id/phases/:phaseId', (req, res) => {
  db.prepare('DELETE FROM item_phases WHERE id = ? AND item_id = ?').run([req.params.phaseId, req.params.id]);
  res.json({ message: 'Phase deleted' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run([req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ message: 'Item deleted' });
});

module.exports = router;
