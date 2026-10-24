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
  console.log('Connected to database');
  
  await client.query(`
    DROP POLICY IF EXISTS "Public can view active products" ON public.products;
    CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    TO public
    USING (is_active = true);
  `);
  
  await client.query(`
    DROP POLICY IF EXISTS "Public can view active product variants" ON public.product_variants;
    CREATE POLICY "Public can view active product variants"
    ON public.product_variants FOR SELECT
    TO public
    USING (true);
  `);
  
  await client.query(`
    DROP POLICY IF EXISTS "Public can view approved farms" ON public.farms;
    CREATE POLICY "Public can view approved farms"
    ON public.farms FOR SELECT
    TO public
    USING (status = 'approved');
  `);
  
  await client.query(`
    DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
    CREATE POLICY "Public can view categories"
    ON public.categories FOR SELECT
    TO public
    USING (true);
  `);
  
  console.log('✅ RLS policies updated for public read access.');
  await client.end();
}
run().catch(e => console.error(e.message));