import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';
import { readFileSync } from 'node:fs';

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
  const sql = readFileSync(resolve(projectRoot, 'supabase/migrations/0026_fix_helper_functions.sql'), 'utf8');
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');

  const fnRes = await client.query(`
    SELECT n.nspname, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname IN ('user_role', 'current_user_role', 'current_user_farm_id');
  `);
  console.log('TASK_1_START');
  fnRes.rows.forEach(r => console.log(`${r.nspname}.${r.proname}`));
  console.log('TASK_1_END');

  const rlsRes = await client.query(`
    SELECT tablename, count(*) AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename;
  `);
  console.log('TASK_2_START');
  rlsRes.rows.forEach(r => console.log(`${r.tablename}: ${r.policy_count}`));
  console.log('TASK_2_END');

  console.log('TASK_3_START');
  await client.query("DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE customer_id = '00000000-0000-0000-0000-000000000001')");
  await client.query("DELETE FROM public.orders WHERE customer_id = '00000000-0000-0000-0000-000000000001'");
  await client.query("DELETE FROM public.batches WHERE batch_number = 'TEST-BATCH-001'");

  const batchRes = await client.query(`
    INSERT INTO public.batches (batch_number, farm_id, quantity, remaining_qty, unit, qc_status)
    VALUES ('TEST-BATCH-001', (SELECT id FROM public.farms LIMIT 1), 100, 100, 'kg', 'pending')
    RETURNING id;
  `);
  const batchId = batchRes.rows[0].id;

  const orderRes = await client.query(`
    INSERT INTO public.orders (customer_id, status, total_amount, currency)
    VALUES ('00000000-0000-0000-0000-000000000001', 'placed', 50.00, 'SAR')
    RETURNING id;
  `);
  const orderId = orderRes.rows[0].id;

  await client.query(`
    INSERT INTO public.order_items (order_id, product_id, product_variant_id, farm_id, quantity, unit_price, batch_id)
    VALUES ($1, (SELECT id FROM public.products LIMIT 1), (SELECT id FROM public.product_variants LIMIT 1), (SELECT id FROM public.farms LIMIT 1), 2, 25.00, $2);
  `, [orderId, batchId]);

  await client.query("UPDATE public.orders SET status = 'preparing' WHERE id = $1", [orderId]);
  await client.query("UPDATE public.orders SET status = 'quality_check' WHERE id = $1", [orderId]);

  try {
    await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
    console.log('ERROR: should have failed');
  } catch (err) {
    console.log('TRIGGER_BLOCK_SUCCESS: ' + err.message);
  }

  await client.query("UPDATE public.batches SET qc_status = 'approved' WHERE id = $1", [batchId]);
  await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
  console.log('SHIP_SUCCESS');

  await client.query("UPDATE public.orders SET status = 'delivered' WHERE id = $1", [orderId]);
  console.log('DELIVER_SUCCESS');

  const orderRes2 = await client.query(`
    INSERT INTO public.orders (customer_id, status, total_amount, currency)
    VALUES ('00000000-0000-0000-0000-000000000001', 'placed', 50.00, 'SAR')
    RETURNING id;
  `);
  const orderId2 = orderRes2.rows[0].id;

  try {
    await client.query("UPDATE public.orders SET status = 'delivered' WHERE id = $1", [orderId2]);
    console.log('ERROR: should have failed transition');
  } catch (err) {
    console.log('TRANSITION_BLOCK_SUCCESS: ' + err.message);
  }

  await client.query("DELETE FROM public.order_items WHERE order_id IN ($1, $2)", [orderId, orderId2]);
  await client.query("DELETE FROM public.orders WHERE id IN ($1, $2)", [orderId, orderId2]);
  await client.query("DELETE FROM public.batches WHERE id = $1", [batchId]);
  console.log('CLEANUP_DONE');

  const oCount = await client.query('SELECT count(*) FROM orders');
  const oiCount = await client.query('SELECT count(*) FROM order_items');
  const bCount = await client.query('SELECT count(*) FROM batches');
  console.log('ORDERS_COUNT=' + oCount.rows[0].count);
  console.log('ORDER_ITEMS_COUNT=' + oiCount.rows[0].count);
  console.log('BATCHES_COUNT=' + bCount.rows[0].count);
  console.log('TASK_3_END');

  await client.end();
}

main().catch(console.error);
