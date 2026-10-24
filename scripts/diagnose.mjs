import fs from 'node:fs';

const buf = fs.readFileSync('supabase/migrations/0021_settings_seed.sql');
const str = buf.toString('utf8');
const arabic = (str.match(/[؀-ۿ]/g) || []);
const presentation = (str.match(/[ﹰ-﻿]/g) || []);
console.log('File bytes:', buf.length);
console.log('Arabic chars (U+0600-06FF):', arabic.length);
console.log('Presentation forms (U+FE70-FEFF):', presentation.length);
if (arabic.length > 0) {
  console.log('First Arabic sample codepoints:', arabic.slice(0, 10).map(c => c.codePointAt(0).toString(16)));
}

import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { Client } = pkg;

async function checkDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const res = await client.query("SELECT key, encode(convert_to(description_ar, 'UTF8'), 'hex') as hex FROM settings;");
  console.log('Database hex output:');
  res.rows.forEach(r => console.log(`${r.key}: ${r.hex}`));
  await client.end();
}

checkDb();
