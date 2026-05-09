require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.endsWith('.railway.app')) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(morgan('dev'));
app.use(express.json());

['items', 'installations', 'receipts'].forEach(dir => {
  const p = path.join(__dirname, 'uploads', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/donations', require('./routes/status'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/connections', require('./routes/connections'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  autoSeed();
});

function autoSeed() {
  try {
    const db = require('./db/database');
    const count = db.prepare('SELECT COUNT(*) as c FROM items').get([]).c;
    if (count > 0) return;
    console.log('Seeding initial data...');
    require('./db/seed');
    console.log('Seed complete.');
  } catch (e) {
    console.error('Auto-seed failed (non-fatal):', e.message);
  }
}
