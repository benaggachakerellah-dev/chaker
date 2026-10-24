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

  console.log('--- SEED DEMO OUTPUT START ---');
  // Re-run seed logic or print counts
  const res = await client.query(`
    SELECT 'farms' AS table_name, count(*) FROM farms UNION ALL
    SELECT 'products', count(*) FROM products UNION ALL
    SELECT 'variants', count(*) FROM product_variants UNION ALL
    SELECT 'batches', count(*) FROM batches UNION ALL
    SELECT 'inspections', count(*) FROM quality_inspections;
  `);
  res.rows.forEach(r => console.log(`${r.table_name}: ${r.count}`));
  console.log('--- SEED DEMO OUTPUT END ---');

  await client.end();
}

run();
