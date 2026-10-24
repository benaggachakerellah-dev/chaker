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

async function main() {
  await client.connect();

  console.log('--- SEED SCRIPT EXECUTION ---');
  // Categories
  await client.query(`
    INSERT INTO public.categories (slug, name_ar, name_fr, name_en, data_source) VALUES
    ('ajwa', 'تمر عجوة مدينة', 'Dattes Ajwa', 'Ajwa Dates', 'synthetic'),
    ('sukari', 'تمر سكري', 'Dattes Sukari', 'Sukari Dates', 'synthetic'),
    ('medjool', 'تمر مجهول', 'Dattes Medjool', 'Medjool Dates', 'synthetic')
    ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar;
  `);

  const profileRes = await client.query('SELECT id FROM public.profiles LIMIT 1');
  const ownerId = profileRes.rows[0].id;

  const farmRes = await client.query(`
    INSERT INTO public.farms (owner_id, name_ar, name_fr, name_en, location, status, data_source) VALUES
    ($1, 'واحة النخيل الذهبي بسكرة', 'Oasis Palmier d''Or Biskra', 'Golden Palm Oasis Biskra', 'Biskra, Algeria', 'approved', 'synthetic')
    ON CONFLICT DO NOTHING
    RETURNING id;
  `, [ownerId]);

  const farmRow = await client.query('SELECT id FROM public.farms LIMIT 1');
  const farmId = farmRow.rows[0].id;
  const catRow = await client.query('SELECT id FROM public.categories WHERE slug = \'ajwa\' LIMIT 1');
  const catId = catRow.rows[0].id;

  const prodRes = await client.query(`
    INSERT INTO public.products (farm_id, category_id, name_ar, name_fr, name_en, description_ar, description_fr, description_en, grade, is_active, data_source) VALUES
    ($1, $2, 'تمر عجوة المدين الفاخر', 'Dattes Ajwa Premium', 'Premium Ajwa Dates', 'تمر عجوة فاخر', 'Dattes Ajwa', 'Ajwa Dates', 'Premium', true, 'synthetic')
    RETURNING id;
  `, [farmId, catId]);
  const prodId = prodRes.rows[0].id;

  await client.query(`
    INSERT INTO public.product_variants (product_id, sku, weight_grams, price_dzd, stock_qty, is_active) VALUES
    ($1, 'AJWA-500G', 500, 1800.00, 150, true)
    ON CONFLICT DO NOTHING;
  `, [prodId]);

  const batchRes = await client.query(`
    INSERT INTO public.batches (batch_number, farm_id, quantity, remaining_qty, unit, harvest_date, expiry_date, qc_status, data_source) VALUES
    ('BATCH-DZ-2026-001', $1, 500, 500, 'kg', '2026-09-15', '2027-09-15', 'approved', 'synthetic')
    RETURNING id;
  `, [farmId]);
  const batchId = batchRes.rows[0].id;

  await client.query(`
    INSERT INTO public.quality_inspections (batch_id, inspector_id, status, notes, data_source) VALUES
    ($1, $2, 'passed', 'Passed all checks', 'synthetic')
    ON CONFLICT DO NOTHING;
  `, [batchId, ownerId]);

  console.log('✅ Seed demo completed successfully.');

  console.log('\n--- TASK 1 TABLE COUNTS ---');
  const counts = await client.query(`
    SELECT 'farms' AS table_name, count(*) FROM farms UNION ALL
    SELECT 'products', count(*) FROM products UNION ALL
    SELECT 'variants', count(*) FROM product_variants UNION ALL
    SELECT 'batches', count(*) FROM batches UNION ALL
    SELECT 'inspections', count(*) FROM quality_inspections;
  `);
  counts.rows.forEach(r => console.log(`${r.table_name}: ${r.count}`));

  console.log('\n--- SAMPLE PRODUCT ID ---');
  const sampleProd = await client.query('SELECT id FROM products LIMIT 1');
  console.log('PRODUCT_ID=' + sampleProd.rows[0].id);

  await client.end();
}

main();
