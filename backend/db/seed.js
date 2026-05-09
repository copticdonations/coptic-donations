const db = require('./database');

const count = db.prepare('SELECT COUNT(*) as c FROM items').get([]).c;
if (count > 0) {
  if (require.main === module) console.log('Already seeded.');
  return;
}

const items = [
  { title: 'Beeswax Altar Candles Set', description: 'Hand-poured pure beeswax candles for the main altar, lasting 40+ hours each. A staple of Coptic worship, these candles fill the sanctuary with a warm, natural light during the Divine Liturgy.', suggested_amount: 75, category: 'Sanctuary' },
  { title: 'Icon of the Virgin Mary', description: 'Hand-painted egg-tempera icon on linden wood following Coptic iconographic tradition. Each icon is blessed by a priest before delivery and will serve as a focal point for prayer and veneration.', suggested_amount: 350, category: 'Icons' },
  { title: 'Processional Cross', description: 'Silver-plated brass processional cross with traditional Coptic engravings, standing 5 feet tall. Carried at the head of every liturgical procession, symbolizing the triumph of Christ.', suggested_amount: 500, category: 'Sanctuary' },
  { title: "Deacon's Tunic (Toniya)", description: 'White embroidered liturgical tunic for deacons, handcrafted in Egypt. Available in sizes S-XL. These vestments honor the ancient tradition of Coptic liturgical dress dating back to the early Church.', suggested_amount: 180, category: 'Liturgical Vestments' },
  { title: 'Wooden Pew (6-Seat)', description: 'Solid oak pew with Coptic cross carved into the armrests, seats 6 adults comfortably. Built by master craftsmen to last generations and serve the faithful during worship.', suggested_amount: 1200, category: 'Church Furniture' },
  { title: 'Icon of St. George', description: 'Byzantine-style icon depicting St. George the Martyr on horseback, hand-painted in Alexandria by trained iconographers. St. George holds special significance in Coptic tradition.', suggested_amount: 280, category: 'Icons' },
  { title: 'Liturgical Lectionary', description: 'Bound Coptic lectionary with English-Arabic parallel text, gold-embossed cover. Contains all scripture readings for the Coptic liturgical year, used by deacons and priests at the ambon.', suggested_amount: 95, category: 'Sanctuary' },
  { title: 'Altar Cloth Set', description: 'Set of 5 liturgical altar cloths in seasonal colors (red, white, blue, green, purple), embroidered with Coptic cross patterns. Handmade from finest linen by Coptic artisans.', suggested_amount: 150, category: 'Sanctuary' },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const insertItem = db.prepare('INSERT INTO items (title, description, suggested_amount, category) VALUES (?, ?, ?, ?)');
const insertDonation = db.prepare('INSERT INTO donations (item_id, donor_name, donor_email, amount, tracking_code) VALUES (?, ?, ?, ?, ?)');
const insertStatus = db.prepare('INSERT INTO status_updates (donation_id, status, message, timestamp) VALUES (?, ?, ?, ?)');

db.exec('BEGIN');
try {
  for (const item of items) {
    insertItem.run([item.title, item.description, item.suggested_amount, item.category]);
  }

  const d1 = insertDonation.run([6, 'Mary Girgis', 'mary.girgis@example.com', 280, 'CPT-2026-AA01']);
  insertStatus.run([d1.lastInsertRowid, 'received', 'Thank you for your generous donation! We have received it safely.', daysAgo(3)]);

  const d2 = insertDonation.run([3, 'Peter Botros', 'peter.botros@example.com', 500, 'CPT-2026-BB02']);
  insertStatus.run([d2.lastInsertRowid, 'received', 'Donation received with gratitude. May God bless you abundantly.', daysAgo(14)]);
  insertStatus.run([d2.lastInsertRowid, 'processing', 'The cross has been ordered from the artisan workshop in Cairo.', daysAgo(10)]);
  insertStatus.run([d2.lastInsertRowid, 'shipped', 'Your cross is on its way! Estimated arrival in 3 days.', daysAgo(5)]);

  const d3 = insertDonation.run([5, 'Mina Faris', 'mina.faris@example.com', 1200, 'CPT-2026-CC03']);
  insertStatus.run([d3.lastInsertRowid, 'received', 'Donation received. We are deeply grateful for your generosity.', daysAgo(30)]);
  insertStatus.run([d3.lastInsertRowid, 'processing', 'The pew has been ordered from the carpentry workshop.', daysAgo(25)]);
  insertStatus.run([d3.lastInsertRowid, 'shipped', 'The pew has been shipped from the workshop.', daysAgo(15)]);
  insertStatus.run([d3.lastInsertRowid, 'delivered', 'The pew has been delivered to the church.', daysAgo(10)]);
  insertStatus.run([d3.lastInsertRowid, 'installed', "The pew has been blessed and installed in the nave. May it serve God's people for generations to come.", daysAgo(3)]);

  db.exec('COMMIT');
  console.log('Database seeded successfully with 8 items and 3 sample donations.');
  console.log('Tracking codes: CPT-2026-AA01, CPT-2026-BB02, CPT-2026-CC03');
} catch (e) {
  db.exec('ROLLBACK');
  const msg = 'Seed failed: ' + e.message;
  if (require.main === module) { console.error(msg); process.exit(1); }
  else throw new Error(msg);
}
