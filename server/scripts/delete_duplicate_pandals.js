const db = require('../db');

(async () => {
  try {
    console.log('Deleting duplicate pandals by name, keeping the lowest id...');
    const res = await db.query(`
      WITH ranked AS (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(name)) ORDER BY id) AS rn
        FROM pandals
      )
      DELETE FROM pandals p
      USING ranked r
      WHERE p.id = r.id AND r.rn > 1
      RETURNING p.id;
    `);
    console.log(`Deleted ${res.rowCount} duplicate rows.`);
    process.exit(0);
  } catch (e) {
    console.error('Error deleting duplicates:', e);
    process.exit(1);
  }
})();
