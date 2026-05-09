CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY);

CREATE TABLE IF NOT EXISTS items (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  title              TEXT    NOT NULL,
  purpose_impact     TEXT,
  description        TEXT,
  cost               REAL    NOT NULL DEFAULT 0,
  suggested_amount   REAL    DEFAULT 0,
  image_url          TEXT,
  category           TEXT,
  service_benefiting TEXT,
  tax_receipt        TEXT    DEFAULT 'possible',
  link               TEXT,
  need_by_date       TEXT,
  item_status        TEXT    DEFAULT 'available',
  quantity_needed    INTEGER DEFAULT 1,
  created_at         TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id    INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  image_url  TEXT    NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_phases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id     INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  phase_label TEXT    NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1,
  target_date TEXT
);

CREATE TABLE IF NOT EXISTS donations (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id                INTEGER NOT NULL REFERENCES items(id),
  donor_name             TEXT    NOT NULL,
  donor_email            TEXT,
  donor_phone            TEXT,
  amount                 REAL    DEFAULT 0,
  tracking_code          TEXT    NOT NULL UNIQUE,
  tax_receipt_requested  INTEGER DEFAULT 0,
  pending_until          TEXT,
  purchase_date          TEXT,
  purchase_location      TEXT,
  receipt_image_url      TEXT,
  installation_photo_url TEXT,
  anonymous              INTEGER DEFAULT 0,
  created_at             TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_updates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  status      TEXT    NOT NULL CHECK(status IN
              ('commitment_received','item_sent','delivered','tax_receipt_sent','completed')),
  message     TEXT,
  timestamp   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  name       TEXT,
  frequency  TEXT    DEFAULT 'new_items',
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS connections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  phone       TEXT,
  offer_type  TEXT,
  description TEXT,
  item_id     INTEGER REFERENCES items(id),
  created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  type       TEXT    DEFAULT 'general',
  subject    TEXT,
  message    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_tracking ON donations(tracking_code);
CREATE INDEX IF NOT EXISTS idx_status_donation    ON status_updates(donation_id);
CREATE INDEX IF NOT EXISTS idx_item_images_item   ON item_images(item_id);
CREATE INDEX IF NOT EXISTS idx_item_phases_item   ON item_phases(item_id);
