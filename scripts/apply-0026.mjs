import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';
import { readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
config({ path: resolve(projectRoot, '.env.local') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function apply0026() {
  await client.connect();
  console.log('✅ Connected to database');
  const sql = readFileSync(resolve(projectRoot, 'supabase/migrations/0026_fix_helper_functions.sql'), 'utf8');
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✅ Applied 0026_fix_helper_functions.sql successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ ERROR:', e.message);
  } finally {
    await client.end();
  }
}

apply0026();
