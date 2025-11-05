const db = require('../db');

const ids = process.argv.slice(2).map(Number).filter(Boolean);
if (ids.length === 0) {
  console.error('Usage: node scripts/print_db_ids.js <id1> [id2] ...');
  process.exit(1);
}

(async () => {
  try {
    const res = await db.query(
      `SELECT id, name, image_url FROM pandals WHERE id = ANY($1::int[]) ORDER BY id`,
      [ids]
    );
    for (const r of res.rows) {
      console.log(`#${r.id} ${r.name} -> ${r.image_url}`);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
