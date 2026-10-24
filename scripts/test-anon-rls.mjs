import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
config({ path: resolve(projectRoot, '.env.local') });

const anonClient = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await anonClient.connect();
  // Set role to anon to test RLS
  await anonClient.query("SET LOCAL role TO 'anon';");

  try {
    const res = await anonClient.query("SELECT * FROM batches WHERE qc_status = 'pending'");
    console.log('ANON_VISIBLE_PENDING_BATCHES_COUNT=' + res.rows.length);
  } catch (e) {
    console.log('ANON_QUERY_ERROR=' + e.message);
  }

  await anonClient.end();
}

run();
