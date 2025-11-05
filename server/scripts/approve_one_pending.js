const db = require('../db');
const id = Number(process.argv[2] || 0);
(async () => {
  try {
    if (!id) throw new Error('Pass pending id');
    await db.query('BEGIN');
    const res = await db.query('SELECT * FROM pending_pandals WHERE id=$1', [id]);
    if (res.rows.length === 0) throw new Error('Pending not found');
    const p = res.rows[0];
    const visitingHours = `${p.opening_hours || '06:00'} - ${p.closing_hours || '23:00'}`;
    const ins = await db.query(
      `INSERT INTO pandals (name, location, theme, lat, lng, rating, description, image_url, visiting_hours, crowd_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id,name` ,
      [p.name, p.address, 'Community', p.latitude, p.longitude, 4.0, p.description, p.photo_url, visitingHours, 'Medium']
    );
    await db.query('UPDATE pending_pandals SET status=$1 WHERE id=$2', ['approved', id]);
    await db.query('COMMIT');
    console.log('Approved insert', ins.rows[0]);
    process.exit(0);
  } catch (e) {
    await db.query('ROLLBACK').catch(()=>{});
    console.error('Approval failed:', e.message);
    console.error(e);
    process.exit(1);
  }
})();
