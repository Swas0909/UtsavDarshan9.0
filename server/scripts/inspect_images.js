const db = require('../db');

(async () => {
  try {
    const total = await db.query('SELECT COUNT(*) FROM pandals');
    const placeholders = await db.query("SELECT COUNT(*) FROM pandals WHERE image_url = '/images/placeholder.jpg' OR image_url IS NULL OR image_url = ''");
    const nonPlaceholder = await db.query("SELECT COUNT(*) FROM pandals WHERE image_url IS NOT NULL AND image_url <> '' AND image_url <> '/images/placeholder.jpg'");
    const samples = await db.query("SELECT id, name, image_url FROM pandals ORDER BY id LIMIT 10");

    console.log('Total pandals       :', total.rows[0].count);
    console.log('With placeholder    :', placeholders.rows[0].count);
    console.log('With real image_url :', nonPlaceholder.rows[0].count);
    console.log('\nFirst 10 rows:');
    for (const r of samples.rows) {
      console.log(`#${r.id} ${r.name} -> ${r.image_url}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
