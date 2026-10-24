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
  console.log('--- START QC WORKFLOW TEST ---');

  try {
    // 1. Get a farm and product
    const farmRes = await client.query('SELECT id FROM public.farms LIMIT 1');
    const farmId = farmRes.rows[0].id;

    const prodRes = await client.query('SELECT id FROM public.products WHERE farm_id = $1 LIMIT 1', [farmId]);
    const productId = prodRes.rows[0].id;

    // 2. Create a pending batch
    const locRes = await client.query('SELECT id FROM public.inspection_locations LIMIT 1');
    const locationId = locRes.rows[0].id;

    const batchRes = await client.query(`
      INSERT INTO public.batches (batch_code, product_id, location_id, harvest_date, expiry_date, quantity_kg, qc_status, data_source)
      VALUES ('TEST-BATCH-PENDING', $1, $2, '2026-01-01', '2027-01-01', 100.00, 'pending', 'synthetic')
      RETURNING id
    `, [productId, locationId]);
    const batchId = batchRes.rows[0].id;
    console.log('Created pending batch:', batchId);

    // 3. Create a customer and an order
    const customerRes = await client.query('SELECT id FROM public.profiles LIMIT 1');
    const customerId = customerRes.rows[0].id;

    const orderRes = await client.query(`
      INSERT INTO public.orders (order_no, customer_id, status, subtotal, shipping_fee, total, payment_method, address_id, data_source)
      VALUES ('TEST-ORDER-1', $1, 'preparing', 1000.00, 500.00, 1500.00, 'cod', (SELECT id FROM public.addresses LIMIT 1), 'synthetic')
      RETURNING id
    `, [customerId]);
    const orderId = orderRes.rows[0].id;
    console.log('Created order:', orderId);

    // 4. Try to assign the PENDING batch to the order (should fail at DB level when shipping, but we test the trigger)
    // First, we need to insert order_items (which is allowed)
    await client.query(`
      INSERT INTO public.order_items (order_id, variant_id, farm_id, batch_id, quantity, unit_price, commission_amount)
      VALUES ($1, (SELECT id FROM public.product_variants LIMIT 1), $2, $3, 1, 1000.00, 100.00)
    `, [orderId, farmId, batchId]);

    // 5. Try to move the order to 'shipped' -> Should FAIL because batch is pending
    let triggerBlocked = false;
    try {
      await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
    } catch (e) {
      console.log('✅ Trigger successfully blocked shipping without QC (pending batch).');
      console.log('   Error:', e.message);
      triggerBlocked = true;
    }
    if (!triggerBlocked) {
      console.log('❌ ERROR: The trigger did not block shipping with a pending batch!');
    }

    // 6. Approve the batch (simulate inspector)
    await client.query("UPDATE public.batches SET qc_status = 'approved' WHERE id = $1", [batchId]);
    await client.query(`
      INSERT INTO public.quality_inspections (batch_id, inspector_id, result, notes, data_source)
      VALUES ($1, $2, 'approved', 'Passed', 'synthetic')
    `, [batchId, customerId]);
    console.log('Approved the batch.');

    // 7. Try to move the order to 'shipped' again -> Should SUCCEED
    try {
      await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
      console.log('✅ Order successfully shipped with approved batch.');
    } catch (e) {
      console.log('❌ ERROR: Failed to ship even after batch approval:', e.message);
    }

    // 8. Try an invalid transition (e.g., placed -> delivered)
    const orderRes2 = await client.query(`
      INSERT INTO public.orders (order_no, customer_id, status, subtotal, shipping_fee, total, payment_method, address_id, data_source)
      VALUES ('TEST-ORDER-2', $1, 'placed', 1000.00, 500.00, 1500.00, 'cod', (SELECT id FROM public.addresses LIMIT 1), 'synthetic')
      RETURNING id
    `, [customerId]);
    const orderId2 = orderRes2.rows[0].id;

    try {
      await client.query("UPDATE public.orders SET status = 'delivered' WHERE id = $1", [orderId2]);
      console.log('❌ ERROR: Invalid transition (placed -> delivered) was allowed!');
    } catch (e) {
      console.log('✅ Trigger successfully blocked invalid transition (placed -> delivered).');
      console.log('   Error:', e.message);
    }

    // Cleanup
    await client.query('DELETE FROM order_items WHERE order_id IN ($1, $2)', [orderId, orderId2]);
    await client.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId, orderId2]);
    await client.query('DELETE FROM quality_inspections WHERE batch_id = $1', [batchId]);
    await client.query('DELETE FROM batches WHERE id = $1', [batchId]);
    console.log('Cleaned up test data.');

  } catch (e) {
    console.error('❌ QC Test Failed:', e);
  } finally {
    await client.end();
  }
}

run();