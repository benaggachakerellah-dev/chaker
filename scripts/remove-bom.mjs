import fs from 'node:fs';

const files = [
  'src/locales/ar.json',
  'supabase/migrations/0021_settings_seed.sql',
  'supabase/migrations/0002_farms.sql',
  'supabase/migrations/0004_products.sql',
  'supabase/migrations/0006_inspection_locations.sql'
];

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
    fs.writeFileSync(file, text, 'utf8');
    console.log(`Removed BOM from: ${file}`);
  }
}
