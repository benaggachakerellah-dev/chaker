import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const scriptsDir = resolve(process.cwd(), 'scripts');
console.log('Contents of scripts/:');
readdirSync(scriptsDir).forEach(file => {
  console.log(`- ${file}`);
});
