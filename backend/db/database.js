const { Database } = require('node-sqlite3-wasm');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'coptic.sqlite3');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.exec('PRAGMA foreign_keys = ON');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

try {
  require('./migrate')(db);
} catch (e) {
  console.error('Migration error (server will continue):', e.message);
}

module.exports = db;
