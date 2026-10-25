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
  console.log('--- DB CART INSPECTION ---');
  
  const carts = await client.query('SELECT id, user_id FROM public.carts');
  console.log('Total Carts:', carts.rows.length);
  console.log(carts.rows);

  const items = await client.query('SELECT id, cart_id, variant_id, quantity FROM public.cart_items');
  console.log('Total Cart Items:', items.rows.length);
  console.log(items.rows);

  await client.end();
}
run().catch(e => console.error(e.message));
