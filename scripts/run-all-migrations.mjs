import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';
import { readdirSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
config({ path: resolve(projectRoot, '.env.local') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('✅ Connected to database');

  const dir = resolve(projectRoot, 'supabase/migrations');
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log('Applying: ' + file);
    const sql = readFileSync(resolve(dir, file), 'utf8');
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('  -> Success');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('❌ ERROR in ' + file + ': ' + e.message);
      process.exit(1);
    }
  }

  console.log('\nAll migrations applied successfully!');

  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Total tables created: ' + res.rows.length);

  await client.end();
}

run().catch(e => console.error(e.message));
