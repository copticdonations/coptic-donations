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

module.exports = db;
