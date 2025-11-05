const path = require('path');
const fs = require('fs');

const id = Number(process.argv[2]);
if (!id) {
  console.error('Usage: node scripts/print_json_id.js <id>');
  process.exit(1);
}

const jsonPath = path.join(__dirname, '..', 'data', 'pandals.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const list = Array.isArray(data.pandals) ? data.pandals : [];
const p = list.find(x => x.id === id);
if (!p) {
  console.log('ID not found in JSON:', id);
  process.exit(0);
}
console.log('Found ID:', id);
console.log('name     :', p.name);
console.log('imageUrl :', p.imageUrl);
console.log('image_url:', p.image_url);