const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { uploadItem } = require('../middleware/upload');

router.get('/', (req, res) => {
  const { category } = req.query;
  let items;
  if (category) {
    items = db.prepare('SELECT * FROM items WHERE category = ? ORDER BY created_at DESC').all([category]);
  } else {
    items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all([]);
  }
  res.json({ items });
});

router.get('/:id', (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get([req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json({ item });
});

router.post('/', uploadItem.single('image'), (req, res) => {
  const { title, description, suggested_amount, category } = req.body;
  if (!title || !suggested_amount) {
    return res.status(400).json({ error: 'Title and suggested_amount are required' });
  }
  const image_url = req.file ? `/uploads/items/${req.file.filename}` : null;
  const result = db.prepare(
    'INSERT INTO items (title, description, image_url, suggested_amount, category) VALUES (?, ?, ?, ?, ?)'
  ).run([title, description || null, image_url, parseFloat(suggested_amount), category || null]);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Item created successfully' });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run([req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ message: 'Item deleted' });
});

module.exports = router;
