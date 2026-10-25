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
  console.log('Connected to DB');
  
  // 1. Fix carts table RLS
  await client.query(`DROP POLICY IF EXISTS "Users can view own carts" ON public.carts;`);
  await client.query(`
    CREATE POLICY "Users can view own carts"
    ON public.carts FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  `);

  // 2. Fix cart_items table RLS
  await client.query(`DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;`);
  await client.query(`
    CREATE POLICY "Users can manage own cart items"
    ON public.cart_items FOR ALL
    TO authenticated
    USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()))
    WITH CHECK (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));
  `);

  console.log('✅ Cart RLS policies fixed for authenticated users.');
  await client.end();
}
run().catch(e => console.error(e.message));
