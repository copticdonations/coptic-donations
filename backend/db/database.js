const { Database } = require('node-sqlite3-wasm');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'coptic.sqlite3');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// node-sqlite3-wasm uses a directory-based lock; remove stale lock left by crashed instances
try { fs.rmdirSync(dbPath + '.lock'); } catch (_) {}

const db = new Database(dbPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA busy_timeout = 5000');
db.exec('PRAGMA foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

try {
  require('./migrate')(db);
} catch (e) {
  console.error('Migration error (server will continue):', e.message);
}

// Always ensure required columns exist — runs every startup, no-op if already there.
// This bypasses migration tracking so a previously failed ALTER TABLE always gets retried.
const REQUIRED_COLUMNS = [
  ['items',       'cost_max',             'REAL'],
  ['items',       'treasurer_email',      'TEXT'],
  ['items',       'payment_method',       'TEXT'],
  ['items',       'payment_instructions', 'TEXT'],
  ['item_phases', 'phase_notes',          'TEXT'],
  ['donations',   'receipt_uploaded_at',  'TEXT'],
  ['donations',   'commitment_details',   'TEXT'],
  ['connections', 'notes',                'TEXT'],
];
for (const [table, col, def] of REQUIRED_COLUMNS) {
  const exists = db.prepare(`PRAGMA table_info(${table})`).all([]).some(c => c.name === col);
  if (!exists) {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      console.log(`Added column ${table}.${col}`);
    } catch (e) {
      console.error(`Could not add ${table}.${col}:`, e.message);
    }
  }
}

// Always check and fix status_updates schema if it still has the old CHECK constraint.
// The v2 migration may have failed due to lock contention — this retries it every startup.
const STATUS_MAP = {
  received: 'commitment_received', processing: 'commitment_received',
  shipped: 'item_sent', delivered: 'delivered', installed: 'completed',
};
try {
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='status_updates'").get([]);
  if (tableInfo && tableInfo.sql && tableInfo.sql.includes("'received'")) {
    console.log('Old status_updates schema detected — attempting fix...');
    const rows = db.prepare('SELECT * FROM status_updates').all([]);
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
        ins.run([r.id, r.donation_id, STATUS_MAP[r.status] || 'commitment_received', r.message, r.timestamp]);
      }
      db.exec('DROP TABLE status_updates');
      db.exec('ALTER TABLE status_updates_v2 RENAME TO status_updates');
      db.exec('CREATE INDEX IF NOT EXISTS idx_status_donation ON status_updates(donation_id)');
      db.exec('COMMIT');
      console.log('status_updates schema fixed successfully');
    } catch (e) {
      try { db.exec('ROLLBACK'); } catch (_) {}
      console.error('status_updates fix failed (will retry on next startup):', e.message);
    }
  }
} catch (e) {
  console.error('status_updates check failed:', e.message);
}

module.exports = db;
