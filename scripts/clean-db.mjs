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
  console.log('Cleaning all demo data...');
  
  // Delete in order to respect foreign keys
  const tables = [
    'inspection_items', 'quality_inspections', 'batches',
    'cart_items', 'carts', 'order_events', 'order_items', 'orders',
    'product_variants', 'products', 'categories', 'farms'
  ];
  
  for (const table of tables) {
    await client.query('DELETE FROM ' + table);
  }
  console.log('✅ All demo data cleaned');
  await client.end();
}
run().catch(e => console.error(e.message));
