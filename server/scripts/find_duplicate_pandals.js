const db = require('../db');

(async () => {
  try {
    const dup = await db.query(`
      SELECT LOWER(TRIM(name)) AS key, COUNT(*) AS cnt,
             ARRAY_AGG(id ORDER BY id) AS ids
      FROM pandals
      GROUP BY LOWER(TRIM(name))
      HAVING COUNT(*) > 1
      ORDER BY cnt DESC, key ASC;
    `);
    console.log('Duplicate pandals by name:', dup.rows.length);
    for (const r of dup.rows.slice(0, 50)) {
      console.log(`${r.cnt}x ${r.key} -> ids: {${r.ids.join(', ')}}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
