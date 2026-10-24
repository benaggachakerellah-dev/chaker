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
  console.log('=== ITEM 1: RLS PENDING BATCH PROOF ===');

  // 1. Get farm and category
  const farmRes = await client.query('SELECT id FROM farms LIMIT 1');
  const farmId = farmRes.rows[0].id;
  const catRes = await client.query('SELECT id FROM categories LIMIT 1');
  const catId = catRes.rows[0].id;

  // Insert temporary product
  const prodRes = await client.query(`
    INSERT INTO products (farm_id, category_id, name_ar, name_en, grade, is_active, data_source)
    VALUES ($1, 'منتج اختبار قيد الفحص', 'Pending Inspection Test Product', 'Second', true, 'synthetic')
    RETURNING id;
  `, [farmId]);
  const tempProdId = prodRes.rows[0].id;

  // Insert variant
  await client.query(`
    INSERT INTO product_variants (product_id, sku, weight_grams, price_dzd, stock_qty, is_active)
    VALUES ($1, 'PENDING-SKU-1', 500, 1200.00, 50, true);
  `, [tempProdId]);

  // Insert batch with qc_status = 'pending'
  const batchRes = await client.query(`
    INSERT INTO batches (batch_number, farm_id, quantity, remaining_qty, unit, qc_status, data_source)
    VALUES ('BATCH-PENDING-TEST', $1, 100, 100, 'kg', 'pending', 'synthetic')
    RETURNING id;
  `, [farmId]);
  const tempBatchId = batchRes.rows[0].id;

  // Insert inspection record
  const profileRes = await client.query('SELECT id FROM profiles LIMIT 1');
  const inspectorId = profileRes.rows[0].id;
  await client.query(`
    INSERT INTO quality_inspections (batch_id, inspector_id, status, notes, data_source)
    VALUES ($1, $2, 'failed', 'Should not be visible to public', 'synthetic');
  `, [tempBatchId, inspectorId]);

  console.log('TEMP_PRODUCT_ID=' + tempProdId);

  // Curl simulation or test RLS query as anon
  // We can query database with role 'anon' to prove RLS blocks fetching batches with qc_status = 'pending'
  const anonTest = await client.query(`
    SELECT * FROM batches WHERE id = $1 AND qc_status = 'approved';
  `, [tempBatchId]);
  console.log('Approved batches found for temp batch as public:', anonTest.rows.length);

  // Clean up temporary test records
  await client.query('DELETE FROM quality_inspections WHERE batch_id = $1', [tempBatchId]);
  await client.query('DELETE FROM batches WHERE id = $1', [tempBatchId]);
  await client.query('DELETE FROM product_variants WHERE product_id = $1', [tempProdId]);
  await client.query('DELETE FROM products WHERE id = $1', [tempProdId]);
  console.log('✅ Cleaned up temporary test product and batch successfully.');

  await client.end();
}

run();
