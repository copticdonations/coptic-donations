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

module.exports = db;
