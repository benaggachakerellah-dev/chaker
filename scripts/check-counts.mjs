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

  // Clean or reset if needed, then seed
  // Let's run seed logic directly here or via import
  const counts = await client.query(`
    SELECT 'farms' AS table_name, count(*) FROM farms UNION ALL
    SELECT 'products', count(*) FROM products UNION ALL
    SELECT 'variants', count(*) FROM product_variants UNION ALL
    SELECT 'batches', count(*) FROM batches UNION ALL
    SELECT 'inspections', count(*) FROM quality_inspections;
  `);
  console.table(counts.rows);

  await client.end();
}

run();
