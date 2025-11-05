const db = require('../db');

(async () => {
  try {
    const pendingCount = await db.query('SELECT COUNT(*) FROM pending_pandals WHERE status = $1', ['pending']);
    const approvedCount = await db.query('SELECT COUNT(*) FROM pandals');
    
    console.log('\n=== Pandals Status ===');
    console.log('Pending registrations:', pendingCount.rows[0].count);
    console.log('Approved pandals (in main table):', approvedCount.rows[0].count);
    
    // Show latest approved pandals
    const latest = await db.query('SELECT id, name, location, created_at FROM pandals ORDER BY id DESC LIMIT 5');
    console.log('\n=== Latest Approved Pandals ===');
    for (const p of latest.rows) {
      console.log(`#${p.id} ${p.name} - ${p.location}`);
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
