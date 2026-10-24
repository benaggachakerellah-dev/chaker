import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src', 'locales');
const locales = ['ar', 'fr', 'en'];

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const k of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      keys = keys.concat(getAllKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

const baseLang = 'ar';
const basePath = path.join(localesDir, `${baseLang}.json`);
const baseContent = JSON.parse(fs.readFileSync(basePath, 'utf8'));
const baseKeys = getAllKeys(baseContent);

let hasError = false;

for (const loc of locales) {
  if (loc === baseLang) continue;
  const locPath = path.join(localesDir, `${loc}.json`);
  if (!fs.existsSync(locPath)) {
    console.error(`❌ Missing locale file: ${loc}.json`);
    hasError = true;
    continue;
  }
  const locContent = JSON.parse(fs.readFileSync(locPath, 'utf8'));
  const locKeys = getAllKeys(locContent);

  const missing = baseKeys.filter((k) => !locKeys.includes(k));
  const extra = locKeys.filter((k) => !baseKeys.includes(k));

  if (missing.length > 0 || extra.length > 0) {
    console.error(`❌ i18n key mismatch in ${loc}.json:`);
    if (missing.length) console.error(`   Missing keys: ${missing.join(', ')}`);
    if (extra.length) console.error(`   Extra keys: ${extra.join(', ')}`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\n❌ i18n check failed: locale key sets do not match.');
  process.exit(1);
} else {
  console.log('✅ i18n check passed: all locale key sets match identically.');
  process.exit(0);
}
