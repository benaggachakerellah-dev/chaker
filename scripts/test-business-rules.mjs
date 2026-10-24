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

async function runTest() {
  await client.connect();
  console.log('✅ Connected to database for testing business rules');

  try {
    // Clean up if prior test left data
    await client.query("DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE customer_id = '00000000-0000-0000-0000-000000000001')");
    await client.query("DELETE FROM public.orders WHERE customer_id = '00000000-0000-0000-0000-000000000001'");
    await client.query("DELETE FROM public.batches WHERE batch_number = 'TEST-BATCH-001'");

    // 1. Insert fake batch with pending status
    const batchRes = await client.query(`
      INSERT INTO public.batches (batch_number, farm_id, quantity, remaining_qty, unit, qc_status)
      VALUES ('TEST-BATCH-001', (SELECT id FROM public.farms LIMIT 1), 100, 100, 'kg', 'pending')
      RETURNING id;
    `);
    const batchId = batchRes.rows[0].id;
    console.log('Created pending batch:', batchId);

    // 2. Insert fake order & order_item
    const orderRes = await client.query(`
      INSERT INTO public.orders (customer_id, status, total_amount, currency)
      VALUES ('00000000-0000-0000-0000-000000000001', 'placed', 50.00, 'SAR')
      RETURNING id;
    `);
    const orderId = orderRes.rows[0].id;
    console.log('Created test order:', orderId);

    await client.query(`
      INSERT INTO public.order_items (order_id, product_id, product_variant_id, farm_id, quantity, unit_price, batch_id)
      VALUES ($1, (SELECT id FROM public.products LIMIT 1), (SELECT id FROM public.product_variants LIMIT 1), (SELECT id FROM public.farms LIMIT 1), 2, 25.00, $2);
    `, [orderId, batchId]);

    // Transition placed -> preparing -> quality_check
    await client.query("UPDATE public.orders SET status = 'preparing' WHERE id = $1", [orderId]);
    await client.query("UPDATE public.orders SET status = 'quality_check' WHERE id = $1", [orderId]);

    // 3. Attempt to update order to 'shipped' with pending batch (should fail)
    try {
      await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
      console.log('❌ UNEXPECTED: Shipped successfully with pending batch!');
    } catch (err) {
      if (err.message.includes('not approved')) {
        console.log('✅ Trigger successfully blocked shipping without QC.');
      } else {
        console.log('⚠️ Caught unexpected error during shipping block test:', err.message);
      }
    }

    // 4. Update batch to approved, then try again
    await client.query("UPDATE public.batches SET qc_status = 'approved' WHERE id = $1", [batchId]);
    console.log('Updated batch to approved.');

    await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
    console.log('✅ Order successfully shipped with approved batch.');

    // Finally deliver
    await client.query("UPDATE public.orders SET status = 'delivered' WHERE id = $1", [orderId]);
    console.log('✅ Order successfully delivered.');

    // 5. Attempt invalid status jump (placed -> delivered directly on a new order)
    const orderRes2 = await client.query(`
      INSERT INTO public.orders (customer_id, status, total_amount, currency)
      VALUES ('00000000-0000-0000-0000-000000000001', 'placed', 50.00, 'SAR')
      RETURNING id;
    `);
    const orderId2 = orderRes2.rows[0].id;

    try {
      await client.query("UPDATE public.orders SET status = 'delivered' WHERE id = $1", [orderId2]);
      console.log('❌ UNEXPECTED: Invalid transition allowed!');
    } catch (err) {
      if (err.message.includes('Invalid status transition')) {
        console.log('✅ Trigger successfully blocked invalid transition.');
      } else {
        console.log('⚠️ Caught unexpected error during transition test:', err.message);
      }
    }

    // Clean up test data
    await client.query("DELETE FROM public.order_items WHERE order_id IN ($1, $2)", [orderId, orderId2]);
    await client.query("DELETE FROM public.orders WHERE id IN ($1, $2)", [orderId, orderId2]);
    await client.query("DELETE FROM public.batches WHERE id = $1", [batchId]);
    console.log('✅ Cleaned up test data successfully.');

  } catch (e) {
    console.error('❌ Test script error:', e);
  } finally {
    await client.end();
  }
}

runTest();
