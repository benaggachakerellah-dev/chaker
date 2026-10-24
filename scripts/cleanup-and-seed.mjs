import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';
import { unlinkSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
config({ path: resolve(projectRoot, '.env.local') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanupAndSeed() {
  await client.connect();
  console.log('Cleaning up temporary verification scripts...');

  const tempScripts = [
    'scripts/execute-all.mjs',
    'scripts/run-seed-and-counts.mjs',
    'scripts/task1-check.mjs',
    'scripts/get-product-id.mjs',
    'scripts/test-anon-rls.mjs',
    'scripts/test-item1.mjs',
    'scripts/check-counts.mjs',
    'scripts/verify-b2.mjs',
    'scripts/apply-0026.mjs',
    'scripts/verify-b2-final.mjs',
    'scripts/quick-check.mjs',
    'scripts/run-all-verifications.mjs',
    'scripts/final-output-gen.mjs'
  ];

  for (const s of tempScripts) {
    try {
      unlinkSync(resolve(projectRoot, s));
      console.log(`Deleted: ${s}`);
    } catch {
      // already deleted or doesn't exist
    }
  }

  console.log('\nRe-seeding database with 4 farms and 6 products...');
  await client.query('BEGIN');

  // Clear products, variants, batches, quality_inspections, farms to ensure clean state
  await client.query('DELETE FROM quality_inspections');
  await client.query('DELETE FROM order_items');
  await client.query('DELETE FROM orders');
  await client.query('DELETE FROM batches');
  await client.query('DELETE FROM product_variants');
  await client.query('DELETE FROM products');
  await client.query('DELETE FROM farms');

  // 1. Categories
  const catRes = await client.query(`
    INSERT INTO public.categories (slug, name_ar, name_fr, name_en, data_source) VALUES
    ('ajwa', 'تمر عجوة مدينة', 'Dattes Ajwa', 'Ajwa Dates', 'synthetic'),
    ('sukari', 'تمر سكري', 'Dattes Sukari', 'Sukari Dates', 'synthetic'),
    ('medjool', 'تمر مجهول', 'Dattes Medjool', 'Medjool Dates', 'synthetic'),
    ('deglet-nour', 'دقلة نور', 'Deglet Nour', 'Deglet Nour Dates', 'synthetic')
    ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
    RETURNING id, slug;
  `);
  const cats = {};
  catRes.rows.forEach(r => { cats[r.slug] = r.id; });

  const profileRes = await client.query('SELECT id FROM public.profiles LIMIT 1');
  const ownerId = profileRes.rows[0].id;

  // 2. Insert 4 Farms
  await client.query(`
    INSERT INTO public.farms (owner_id, name_ar, name_fr, name_en, location, status, data_source) VALUES
    ($1, 'واحة النخيل الذهبي بسكرة', 'Oasis Palmier d''Or Biskra', 'Golden Palm Oasis Biskra', 'Biskra, Algeria', 'approved', 'synthetic'),
    ($1, 'مزارع التمور العالية الوادي', 'Fermes Supérieures El Oued', 'El Oued High Farms', 'El Oued, Algeria', 'approved', 'synthetic'),
    ($1, 'بساتين غرداية العريقة', 'Vergers Historiques Ghardaïa', 'Ghardaia Heritage Orchards', 'Ghardaia, Algeria', 'approved', 'synthetic'),
    ($1, 'واحة الصحراء الكبرى أدرار', 'Oasis Grand Sahara Adrar', 'Grand Sahara Oasis Adrar', 'Adrar, Algeria', 'approved', 'synthetic');
  `, [ownerId]);

  const farms = await client.query('SELECT id FROM public.farms ORDER BY created_at ASC');
  const f1 = farms.rows[0].id;
  const f2 = farms.rows[1].id;
  const f3 = farms.rows[2].id;
  const f4 = farms.rows[3].id;

  // 3. Insert 6 Products (including Ajwa)
  await client.query(`
    INSERT INTO public.products (farm_id, category_id, name_ar, name_fr, name_en, description_ar, description_fr, description_en, grade, is_active, data_source) VALUES
    ($1, $5, 'تمر عجوة المدينة الفاخر', 'Dattes Ajwa Premium', 'Premium Ajwa Dates', 'تمر عجوة فاخر', 'Dattes Ajwa', 'Ajwa Dates', 'Premium', true, 'synthetic'),
    ($1, $6, 'تمر سكري مقرمش', 'Dattes Sukari Croustillantes', 'Crispy Sukari Dates', 'تمر سكري حلو', 'Dattes Sukari', 'Sukari Dates', 'First', true, 'synthetic'),
    ($2, $7, 'تمر مجهول الملكي الحجم الكبير', 'Dattes Medjool Royales Jumbo', 'Jumbo Royal Medjool Dates', 'تمر مجهول ملكي', 'Dattes Medjool', 'Medjool Dates', 'Premium', true, 'synthetic'),
    ($3, $8, 'دقلة نور عرائس توقرت', 'Deglet Nour Touggourt', 'Touggourt Deglet Nour', 'دقلة نور أصيلة', 'Deglet Nour', 'Deglet Nour Dates', 'Premium', true, 'synthetic'),
    ($3, $5, 'تمر عجوة العالية التقييم', 'Dattes Ajwa Spéciale', 'Special Reserve Ajwa', 'عجوة ممتازة', 'Ajwa Spéciale', 'Special Ajwa', 'Premium', true, 'synthetic'),
    ($4, $8, 'دقلة نور الصحراء الكبرى', 'Deglet Nour Sahara', 'Sahara Deglet Nour', 'دقلة نور ممتازة', 'Deglet Nour', 'Deglet Nour', 'First', true, 'synthetic');
  `, [f1, f2, f3, f4, cats['ajwa'], cats['sukari'], cats['medjool'], cats['deglet-nour']]);

  // 4. Insert Variants
  const prods = await client.query('SELECT id FROM public.products');
  for (const p of prods.rows) {
    await client.query(`
      INSERT INTO public.product_variants (product_id, sku, weight_grams, price_dzd, stock_qty, is_active) VALUES
      ($1, 'SKU-' || substr(md5(random()::text), 1, 6), 1000, 2500.00, 100, true);
    `, [p.id]);
  }

  // 5. Insert Batches & Inspections
  const bRes = await client.query(`
    INSERT INTO public.batches (batch_number, farm_id, quantity, remaining_qty, unit, harvest_date, expiry_date, qc_status, data_source) VALUES
    ('BATCH-2026-001', $1, 500, 500, 'kg', '2026-09-15', '2027-09-15', 'approved', 'synthetic'),
    ('BATCH-2026-002', $2, 400, 400, 'kg', '2026-09-20', '2027-09-20', 'approved', 'synthetic'),
    ('BATCH-2026-003', $3, 300, 300, 'kg', '2026-09-25', '2027-09-25', 'approved', 'synthetic')
    RETURNING id;
  `, [f1, f2, f3]);

  await client.query(`
    INSERT INTO public.quality_inspections (batch_id, inspector_id, status, notes, data_source) VALUES
    ($1, $2, 'passed', 'Verified successfully', 'synthetic');
  `, [bRes.rows[0].id, ownerId]);

  await client.query('COMMIT');
  console.log('✅ Cleanup and re-seeding completed successfully.');

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

cleanupAndSeed();
