import fs from 'node:fs';

const content = fs.readFileSync('supabase/migrations/0021_settings_seed.sql', 'utf8');
for (const char of content) {
  const code = char.codePointAt(0);
  if (code >= 0xFE70 && code <= 0xFEFF) {
    console.log(`Found presentation form: ${char} (U+${code.toString(16)})`);
  }
}
console.log('Scan complete.');
