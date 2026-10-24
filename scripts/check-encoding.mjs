import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('.next')) {
        getFiles(filePath, fileList);
      }
    } else if (['.sql', '.json', '.ts', '.tsx'].some(ext => filePath.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allFiles = [
  ...getFiles(path.join(rootDir, 'supabase/migrations')),
  ...getFiles(path.join(rootDir, 'src/locales')),
  ...getFiles(path.join(rootDir, 'src/data'))
];

let errors = 0;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const presentationForms = content.match(/[ﹰ-﻿]/g);
  if (presentationForms && presentationForms.length > 0) {
    console.error(`❌ Error: ${path.relative(rootDir, file)} contains ${presentationForms.length} presentation form characters (U+FE70-U+FEFF).`);
    errors++;
  }
});

if (errors > 0) {
  console.error(`\nEncoding check failed: ${errors} file(s) contain presentation forms.`);
  process.exit(1);
} else {
  console.log('✅ Encoding check passed: No presentation form characters found across migrations and locales.');
}
