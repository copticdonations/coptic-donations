const path = require('path');
const fs = require('fs');

const STATUS_MAP = {
  received: 'commitment_received',
  processing: 'commitment_received',
  shipped: 'item_sent',
  delivered: 'delivered',
  installed: 'completed',
};

function ran(db, name) {
  return !!db.prepare('SELECT name FROM _migrations WHERE name = ?').get([name]);
}

function mark(db, name) {
  db.prepare('INSERT OR IGNORE INTO _migrations (name) VALUES (?)').run([name]);
}

module.exports = function runMigrations(db) {
  const addColumn = (table, col, def) => {
    try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch (_) {}
  };

  if (!ran(db, 'v2_items_new_columns')) {
    addColumn('items', 'purpose_impact', 'TEXT');
    addColumn('items', 'cost', 'REAL DEFAULT 0');
    addColumn('items', 'service_benefiting', 'TEXT');
    addColumn('items', 'tax_receipt', "TEXT DEFAULT 'possible'");
    addColumn('items', 'link', 'TEXT');
    addColumn('items', 'need_by_date', 'TEXT');
    addColumn('items', 'item_status', "TEXT DEFAULT 'available'");
    addColumn('items', 'quantity_needed', 'INTEGER DEFAULT 1');
    db.exec("UPDATE items SET purpose_impact = description WHERE purpose_impact IS NULL OR purpose_impact = ''");
    db.exec("UPDATE items SET cost = suggested_amount WHERE cost = 0 AND suggested_amount > 0");
    mark(db, 'v2_items_new_columns');
  }

  if (!ran(db, 'v2_donations_new_columns')) {
    addColumn('donations', 'donor_phone', 'TEXT');
    addColumn('donations', 'tax_receipt_requested', 'INTEGER DEFAULT 0');
    addColumn('donations', 'pending_until', 'TEXT');
    addColumn('donations', 'purchase_date', 'TEXT');
    addColumn('donations', 'purchase_location', 'TEXT');
    addColumn('donations', 'receipt_image_url', 'TEXT');
    addColumn('donations', 'anonymous', 'INTEGER DEFAULT 0');
    mark(db, 'v2_donations_new_columns');
  }

  if (!ran(db, 'v2_status_updates_new_stages')) {
    const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='status_updates'").get([]);
    const isOldSchema = tableInfo && tableInfo.sql && tableInfo.sql.includes("'received'");
    if (isOldSchema) {
      const rows = db.prepare('SELECT * FROM status_updates').all([]);
      try { db.exec('ROLLBACK'); } catch (_) {}
      db.exec('BEGIN IMMEDIATE');
      try {
        db.exec('DROP TABLE IF EXISTS status_updates_v2');
        db.exec(`CREATE TABLE status_updates_v2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          donation_id INTEGER NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
          status TEXT NOT NULL CHECK(status IN ('commitment_received','item_sent','delivered','tax_receipt_sent','completed')),
          message TEXT,
          timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        const ins = db.prepare('INSERT INTO status_updates_v2 (id, donation_id, status, message, timestamp) VALUES (?, ?, ?, ?, ?)');
        for (const r of rows) {
          const newStatus = STATUS_MAP[r.status] || 'commitment_received';
          ins.run([r.id, r.donation_id, newStatus, r.message, r.timestamp]);
        }
        db.exec('DROP TABLE status_updates');
        db.exec('ALTER TABLE status_updates_v2 RENAME TO status_updates');
        db.exec('CREATE INDEX IF NOT EXISTS idx_status_donation ON status_updates(donation_id)');
        db.exec('COMMIT');
      } catch (e) {
        try { db.exec('ROLLBACK'); } catch (_) {}
        console.error('Status migration failed:', e.message);
        throw e;
      }
    }
    mark(db, 'v2_status_updates_new_stages');
  }

  if (!ran(db, 'v2_new_tables')) {
    db.exec(`CREATE TABLE IF NOT EXISTS item_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS item_phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT, item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      phase_label TEXT NOT NULL, quantity INTEGER NOT NULL DEFAULT 1, target_date TEXT
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT,
      frequency TEXT DEFAULT 'new_items', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
      offer_type TEXT, description TEXT, item_id INTEGER REFERENCES items(id),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
      type TEXT DEFAULT 'general', subject TEXT, message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec('CREATE INDEX IF NOT EXISTS idx_item_images_item ON item_images(item_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_item_phases_item ON item_phases(item_id)');
    mark(db, 'v2_new_tables');
  }

  if (!ran(db, 'v2_treasurer_email')) {
    try { db.exec('ALTER TABLE items ADD COLUMN treasurer_email TEXT'); } catch (_) {}
    mark(db, 'v2_treasurer_email');
  }

  if (!ran(db, 'v2_receipt_uploaded_at')) {
    try { db.exec('ALTER TABLE donations ADD COLUMN receipt_uploaded_at TEXT'); } catch (_) {}
    mark(db, 'v2_receipt_uploaded_at');
  }

  if (!ran(db, 'v2_cost_range')) {
    try { db.exec('ALTER TABLE items ADD COLUMN cost_max REAL'); } catch (_) {}
    mark(db, 'v2_cost_range');
  }

  if (!ran(db, 'v2_connection_notes')) {
    try { db.exec('ALTER TABLE connections ADD COLUMN notes TEXT'); } catch (_) {}
    mark(db, 'v2_connection_notes');
  }

  if (!ran(db, 'v2_migrate_primary_images')) {
    const items = db.prepare("SELECT id, image_url FROM items WHERE image_url IS NOT NULL").all([]);
    const ins = db.prepare('INSERT OR IGNORE INTO item_images (item_id, image_url, sort_order) VALUES (?, ?, 0)');
    for (const item of items) ins.run([item.id, item.image_url]);
    mark(db, 'v2_migrate_primary_images');
  }
};
