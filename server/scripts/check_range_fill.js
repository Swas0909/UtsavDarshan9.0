const db = require('../db');

(async () => {
  try {
    const res = await db.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE id BETWEEN 1 AND 43
        ) AS total,
        COUNT(*) FILTER (
          WHERE id BETWEEN 1 AND 43
          AND image_url IS NOT NULL
          AND image_url <> ''
          AND image_url <> '/images/placeholder.jpg'
        ) AS filled
      FROM pandals;
    `);
    console.log(res.rows[0]);
    const sample = await db.query('SELECT id, name, image_url FROM pandals WHERE id BETWEEN 1 AND 10 ORDER BY id');
    console.log('\nFirst 10:');
    for (const r of sample.rows) {
      console.log(`#${r.id} ${r.name} -> ${r.image_url}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
