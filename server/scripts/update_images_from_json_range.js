/*
  Update pandals.image_url in DB using server/data/pandals.json for a given ID range.
  Default range: 1..43 (inclusive).

  Usage:
    node server/scripts/update_images_from_json_range.js            # uses default 1..43
    node server/scripts/update_images_from_json_range.js 5 20      # custom range
*/

const path = require('path');
const fs = require('fs');
const db = require('../db');

function isString(v) { return typeof v === 'string' && v.length > 0; }

(async () => {
  try {
    const startId = Number(process.argv[2] || 1);
    const endId = Number(process.argv[3] || 43);

    const jsonPath = path.join(__dirname, '..', 'data', 'pandals.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const list = Array.isArray(data.pandals) ? data.pandals : [];

    // Index by id
    const byId = new Map(list.map(p => [p.id, p]));

    let updated = 0;
    let skipped = 0;
    let missing = 0;
    const changes = [];

    for (let id = startId; id <= endId; id++) {
      const p = byId.get(id);
      if (!p) {
        missing++;
        continue;
      }
      const url = p.imageUrl || p.image_url;
      if (!isString(url)) {
        skipped++;
        continue;
      }
      const res = await db.query(
        'UPDATE pandals SET image_url = $1 WHERE id = $2 RETURNING id, name, image_url',
        [url, id]
      );
      if (res.rows.length) {
        updated++;
        changes.push({ id, name: res.rows[0].name, url });
      }
    }

    console.log('Batch update complete');
    console.log('  Range            :', `${startId}..${endId}`);
    console.log('  Updated          :', updated);
    console.log('  Skipped (no URL) :', skipped);
    console.log('  Missing in JSON  :', missing);
    console.log('\nSample (up to 10):');
    for (const c of changes.slice(0, 10)) {
      console.log(`  #${c.id} ${c.name} -> ${c.url}`);
    }

    process.exit(0);
  } catch (e) {
    console.error('Error updating images from JSON:', e);
    process.exit(1);
  }
})();
