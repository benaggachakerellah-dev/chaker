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

async function testCart() {
  await client.connect();
  console.log('--- CART DIAGNOSTIC TEST ---');

  try {
    // 1. Check recent cart items in database
    const res = await client.query('SELECT * FROM public.cart_items ORDER BY id DESC LIMIT 5');
    console.log('Recent cart items in DB:', res.rows);

    // 2. Check carts table
    const cartsRes = await client.query('SELECT * FROM public.carts ORDER BY id DESC LIMIT 5');
    console.log('Recent carts in DB:', cartsRes.rows);

    console.log('✅ Cart diagnostic completed successfully.');
  } catch (e) {
    console.error('❌ Cart test failed:', e);
  } finally {
    await client.end();
  }
}

testCart();
