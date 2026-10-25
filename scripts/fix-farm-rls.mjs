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
  
  // 1. Allow farm owners to view their own farm
  await client.query(`DROP POLICY IF EXISTS "Farm owners can view own farm" ON public.farms;`);
  await client.query(`
    CREATE POLICY "Farm owners can view own farm"
    ON public.farms FOR SELECT
    TO authenticated
    USING (owner_id = auth.uid());
  `);

  // 2. Allow farm owners to manage their own products
  await client.query(`DROP POLICY IF EXISTS "Farm owners can manage own products" ON public.products;`);
  await client.query(`
    CREATE POLICY "Farm owners can manage own products"
    ON public.products FOR ALL
    TO authenticated
    USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()))
    WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));
  `);

  console.log('✅ Farm RLS policies fixed.');
  await client.end();
}
run().catch(e => console.error(e.message));
