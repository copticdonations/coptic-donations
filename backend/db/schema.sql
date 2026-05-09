CREATE TABLE IF NOT EXISTS items (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  description      TEXT,
  image_url        TEXT,
  suggested_amount REAL    NOT NULL DEFAULT 0,
  category         TEXT,
  created_at       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id                     INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id                INTEGER NOT NULL REFERENCES items(id),
  donor_name             TEXT    NOT NULL,
  donor_email            TEXT,
  amount                 REAL    NOT NULL,
  tracking_code          TEXT    NOT NULL UNIQUE,
  installation_photo_url TEXT,
  created_at             TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_updates (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  donation_id INTEGER NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  status      TEXT    NOT NULL CHECK(status IN
              ('received','processing','shipped','delivered','installed')),
  message     TEXT,
  timestamp   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donations_tracking ON donations(tracking_code);
CREATE INDEX IF NOT EXISTS idx_status_donation    ON status_updates(donation_id);
