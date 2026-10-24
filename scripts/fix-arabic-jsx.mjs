import fs from 'node:fs';
import path from 'node:path';

function reverseArabic(str) {
  // Reverse only Arabic characters, keep numbers and Latin in place
  return str.split('').reverse().join('');
}

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.next') && !filePath.includes('.git')) {
        findFiles(filePath, fileList);
      }
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = findFiles('src');
let fixedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find all string literals containing Arabic characters (reversed or not)
  // This is a simplified approach: find Arabic sequences and reverse them
  // But we need to be careful not to double-reverse correct text.

  // Instead, we'll check if the file contains reversed Arabic (e.g., "ةلخنلا" instead of "النخلة")
  // We can't easily detect this programmatically without a dictionary.
  // So, we'll just log files that contain Arabic to manually review.

  const arabicRegex = /[\u0600-\u06FF]+/g;
  const matches = content.match(arabicRegex);
  if (matches) {
    console.log('File with Arabic:', file);
  }
}
