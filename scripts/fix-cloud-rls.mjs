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
  console.log('Connected to cloud database');

  // 1. products
  await client.query(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public can view active products" ON public.products;`);
  await client.query(`
    CREATE POLICY "Public can view active products"
    ON public.products FOR SELECT
    TO public
    USING (is_active = true);
  `);

  // 2. product_variants
  await client.query(`ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public can view active product variants" ON public.product_variants;`);
  await client.query(`
    CREATE POLICY "Public can view active product variants"
    ON public.product_variants FOR SELECT
    TO public
    USING (true);
  `);

  // 3. farms
  await client.query(`ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public can view approved farms" ON public.farms;`);
  await client.query(`
    CREATE POLICY "Public can view approved farms"
    ON public.farms FOR SELECT
    TO public
    USING (status = 'approved');
  `);

  // 4. categories
  await client.query(`ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;`);
  await client.query(`DROP POLICY IF EXISTS "Public can view categories" ON public.categories;`);
  await client.query(`
    CREATE POLICY "Public can view categories"
    ON public.categories FOR SELECT
    TO public
    USING (true);
  `);

  console.log('✅ RLS policies updated for public read access on cloud DB.');
  await client.end();
}
run().catch(e => console.error(e.message));
