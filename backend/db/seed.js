const db = require('./database');

const count = db.prepare('SELECT COUNT(*) as c FROM items').get([]).c;
if (count > 0) {
  if (require.main === module) console.log('Already seeded.');
  return;
}

const items = [
  {
    title: 'Beeswax Altar Candles Set',
    purpose_impact: 'Hand-poured pure beeswax candles for the main altar. These fill the sanctuary with warm, natural light during the Divine Liturgy and last 40+ hours each — a staple of authentic Coptic worship.',
    cost: 75,
    category: 'Sanctuary',
    service_benefiting: 'Main Altar',
    tax_receipt: 'possible',
    quantity_needed: 3,
  },
  {
    title: 'Icon of the Virgin Mary',
    purpose_impact: 'Hand-painted egg-tempera icon on linden wood following Coptic iconographic tradition. Each icon is blessed by a priest before delivery and serves as a focal point for prayer and veneration.',
    cost: 350,
    category: 'Icons',
    service_benefiting: 'Sanctuary',
    tax_receipt: 'yes',
    quantity_needed: 1,
  },
  {
    title: 'Processional Cross',
    purpose_impact: 'Silver-plated brass processional cross with traditional Coptic engravings, standing 5 feet tall. Carried at the head of every liturgical procession, it symbolizes the triumph of Christ.',
    cost: 500,
    category: 'Sanctuary',
    service_benefiting: 'Liturgical Processions',
    tax_receipt: 'yes',
    quantity_needed: 1,
  },
  {
    title: "Deacon's Tunic (Toniya)",
    purpose_impact: 'White embroidered liturgical tunic for deacons, handcrafted in Egypt. These vestments honor the ancient tradition of Coptic liturgical dress dating back to the early Church.',
    cost: 180,
    category: 'Liturgical Vestments',
    service_benefiting: 'Deacons & Clergy',
    tax_receipt: 'possible',
    quantity_needed: 2,
  },
  {
    title: 'Wooden Pew (6-Seat)',
    purpose_impact: 'Solid oak pew with Coptic cross carved into the armrests, seats 6 adults comfortably. Built by master craftsmen to last generations and serve the faithful during worship.',
    cost: 1200,
    category: 'Church Furniture',
    service_benefiting: 'Parish Nave',
    tax_receipt: 'yes',
    quantity_needed: 4,
  },
  {
    title: 'Icon of St. George',
    purpose_impact: 'Byzantine-style icon depicting St. George the Martyr on horseback, hand-painted in Alexandria by trained iconographers. St. George holds special significance in Coptic tradition.',
    cost: 280,
    category: 'Icons',
    service_benefiting: 'Sanctuary',
    tax_receipt: 'yes',
    quantity_needed: 1,
  },
  {
    title: 'Liturgical Lectionary',
    purpose_impact: 'Bound Coptic lectionary with English-Arabic parallel text and gold-embossed cover. Contains all scripture readings for the Coptic liturgical year, used by deacons and priests at the ambon.',
    cost: 95,
    category: 'Sanctuary',
    service_benefiting: 'Liturgy of the Word',
    tax_receipt: 'possible',
    quantity_needed: 2,
  },
  {
    title: 'Altar Cloth Set',
    purpose_impact: 'Set of 5 liturgical altar cloths in seasonal colors (red, white, blue, green, purple), embroidered with Coptic cross patterns. Handmade from finest linen by Coptic artisans.',
    cost: 150,
    category: 'Sanctuary',
    service_benefiting: 'Main Altar',
    tax_receipt: 'possible',
    quantity_needed: 1,
  },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const insertItem = db.prepare(
  'INSERT INTO items (title, purpose_impact, cost, category, service_benefiting, tax_receipt, quantity_needed) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const insertDonation = db.prepare(
  'INSERT INTO donations (item_id, donor_name, donor_email, tracking_code) VALUES (?, ?, ?, ?)'
);
const insertStatus = db.prepare(
  'INSERT INTO status_updates (donation_id, status, message, timestamp) VALUES (?, ?, ?, ?)'
);

db.exec('BEGIN');
try {
  for (const item of items) {
    insertItem.run([item.title, item.purpose_impact, item.cost, item.category, item.service_benefiting, item.tax_receipt, item.quantity_needed]);
  }

  const d1 = insertDonation.run([6, 'Mary Girgis', 'mary.girgis@example.com', 'CPT-2026-AA01']);
  insertStatus.run([d1.lastInsertRowid, 'commitment_received', 'Thank you for your commitment! We have received it and will be in touch soon.', daysAgo(3)]);

  const d2 = insertDonation.run([3, 'Peter Botros', 'peter.botros@example.com', 'CPT-2026-BB02']);
  insertStatus.run([d2.lastInsertRowid, 'commitment_received', 'Commitment received with gratitude. May God bless you abundantly.', daysAgo(14)]);
  insertStatus.run([d2.lastInsertRowid, 'item_sent', 'The cross has been ordered from the artisan workshop in Cairo and is on its way.', daysAgo(5)]);

  const d3 = insertDonation.run([5, 'Mina Faris', 'mina.faris@example.com', 'CPT-2026-CC03']);
  insertStatus.run([d3.lastInsertRowid, 'commitment_received', 'Commitment received. We are deeply grateful for your generosity.', daysAgo(30)]);
  insertStatus.run([d3.lastInsertRowid, 'item_sent', 'The pew has been shipped from the workshop.', daysAgo(20)]);
  insertStatus.run([d3.lastInsertRowid, 'delivered', 'The pew has been delivered to the church.', daysAgo(10)]);
  insertStatus.run([d3.lastInsertRowid, 'completed', "The pew has been blessed and installed in the nave. May it serve God's people for generations to come.", daysAgo(3)]);

  db.exec('COMMIT');
  console.log('Database seeded successfully with 8 items and 3 sample commitments.');
  console.log('Tracking codes: CPT-2026-AA01, CPT-2026-BB02, CPT-2026-CC03');
} catch (e) {
  db.exec('ROLLBACK');
  const msg = 'Seed failed: ' + e.message;
  if (require.main === module) { console.error(msg); process.exit(1); }
  else throw new Error(msg);
}
