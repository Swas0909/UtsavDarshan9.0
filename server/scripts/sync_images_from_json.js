/*
  Sync image_url for all pandals in DB using server/data/pandals.json
  - Matches by normalized name (case-insensitive, strip non-alphanumerics)
  - Uses imageUrl from JSON when the referenced local file exists or when it's an absolute URL
  - Otherwise falls back to /images/placeholder.jpg
*/

const path = require('path');
const fs = require('fs');
const db = require('../db');

const DATA_JSON = path.join(__dirname, '..', 'data', 'pandals.json');
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'client', 'public');
const PLACEHOLDER = '/images/placeholder.jpg';

function normalizeName(name) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function fileExistsForUrl(urlPath) {
  if (!urlPath || !urlPath.startsWith('/')) return false;
  const abs = path.join(PUBLIC_DIR, urlPath.replace(/^\//, ''));
  try {
    return fs.existsSync(abs);
  } catch {
    return false;
  }
}

function isAbsoluteHttpUrl(url) {
  return typeof url === 'string' && /^(https?:)?\/\//i.test(url);
}

async function main() {
  console.log('Loading JSON dataset from', DATA_JSON);
  const raw = fs.readFileSync(DATA_JSON, 'utf-8');
  const json = JSON.parse(raw);
  const list = json.pandals || [];

  // Build map of normalized name -> imageUrl
  const nameToImage = new Map();
  for (const p of list) {
    const norm = normalizeName(p.name);
    if (!norm) continue;
    nameToImage.set(norm, p.imageUrl || p.image_url || null);
  }

  console.log('Fetching pandals from database...');
  const { rows } = await db.query('SELECT id, name, image_url FROM pandals ORDER BY id');

  let updated = 0;
  let unchanged = 0;
  let missingInJson = 0;
  const changes = [];

  for (const row of rows) {
    const norm = normalizeName(row.name);
    let img = nameToImage.get(norm);

    // Determine final URL
    let finalUrl = PLACEHOLDER;
    if (img) {
      if (isAbsoluteHttpUrl(img)) {
        finalUrl = img;
      } else if (fileExistsForUrl(img)) {
        finalUrl = img;
      } else {
        // Try to intelligently guess a filename by slugging the name
        const guess = `/images/pandals/${row.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}.jpg`;
        if (fileExistsForUrl(guess)) {
          finalUrl = guess;
        } else {
          finalUrl = PLACEHOLDER;
        }
      }
    } else {
      missingInJson++;
      // Attempt a filename guess even if not present in JSON
      const guess = `/images/pandals/${row.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}.jpg`;
      if (fileExistsForUrl(guess)) {
        finalUrl = guess;
      } else {
        finalUrl = PLACEHOLDER;
      }
    }

    if (row.image_url !== finalUrl) {
      await db.query('UPDATE pandals SET image_url = $1 WHERE id = $2', [finalUrl, row.id]);
      updated++;
      changes.push({ id: row.id, name: row.name, from: row.image_url, to: finalUrl });
    } else {
      unchanged++;
    }
  }

  console.log('\nUpdate summary:');
  console.log('  Total pandals      :', rows.length);
  console.log('  Updated            :', updated);
  console.log('  Unchanged          :', unchanged);
  console.log('  Missing in JSON    :', missingInJson);

  if (changes.length > 0) {
    console.log('\nSample changes (up to 10):');
    for (const ch of changes.slice(0, 10)) {
      console.log(`  #${ch.id} ${ch.name}: ${ch.from || '(null)'} -> ${ch.to}`);
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error syncing images:', err);
  process.exit(1);
});
