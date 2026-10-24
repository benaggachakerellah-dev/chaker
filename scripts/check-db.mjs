import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';

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

  // Check categories
  const cat = await client.query('SELECT slug, name_ar FROM categories');
  console.log('Categories:', cat.rows);

  // Check products
  const prod = await client.query('SELECT id, name_ar, grade FROM products');
  console.log('Products:', prod.rows);

  // Check batches
  const batch = await client.query('SELECT batch_number, qc_status FROM batches');
  console.log('Batches:', batch.rows);

  await client.end();
}

run();
