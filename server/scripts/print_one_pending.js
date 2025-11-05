const db = require('../db');
(async () => {
  try {
    const res = await db.query('SELECT * FROM pending_pandals WHERE status = $1 ORDER BY id LIMIT 1', ['pending']);
    console.log(res.rows[0]);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
