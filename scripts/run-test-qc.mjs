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
    // 0. Cleanup old test data
    await client.query("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_no LIKE 'TEST-ORDER-%')");
    await client.query("DELETE FROM orders WHERE order_no LIKE 'TEST-ORDER-%'");
    await client.query("DELETE FROM quality_inspections WHERE batch_id IN (SELECT id FROM batches WHERE batch_code LIKE 'TEST-BATCH-%')");
    await client.query("DELETE FROM batches WHERE batch_code LIKE 'TEST-BATCH-%'");

    // 1. Get a farm and product
    const farmRes = await client.query('SELECT id FROM public.farms LIMIT 1');
    const farmId = farmRes.rows[0].id;

    const prodRes = await client.query('SELECT id FROM public.products WHERE farm_id = $1 LIMIT 1', [farmId]);
    const productId = prodRes.rows[0].id;

    const locRes = await client.query('SELECT id FROM public.inspection_locations LIMIT 1');
    const locationId = locRes.rows[0].id;

    // 2. Create a pending batch
    const uniqueCode = 'TEST-BATCH-' + Math.floor(Math.random() * 100000);
    const batchRes = await client.query(`
      INSERT INTO public.batches (batch_code, product_id, location_id, harvest_date, expiry_date, quantity_kg, qc_status, data_source)
      VALUES ($1, $2, $3, '2026-01-01', '2027-01-01', 100.00, 'pending', 'synthetic')
      RETURNING id
    `, [uniqueCode, productId, locationId]);
    const batchId = batchRes.rows[0].id;
    console.log('Created pending batch:', batchId);

    // 3. Get a customer profile and address
    const customerRes = await client.query('SELECT id FROM public.profiles LIMIT 1');
    const customerId = customerRes.rows[0].id;

    let addrRes = await client.query('SELECT id FROM public.addresses LIMIT 1');
    let addressId;
    if (addrRes.rows.length === 0) {
      const newAddr = await client.query(`
        INSERT INTO public.addresses (user_id, recipient, phone, region, city, street)
        VALUES ($1, 'Test Customer', '+2135550001', 'Algiers', 'Algiers', 'Main St')
        RETURNING id
      `, [customerId]);
      addressId = newAddr.rows[0].id;
    } else {
      addressId = addrRes.rows[0].id;
    }

    // 4. Create an order (status: preparing)
    const orderNo = 'TEST-ORDER-' + Math.floor(Math.random() * 100000);
    const orderRes = await client.query(`
      INSERT INTO public.orders (order_no, customer_id, status, subtotal, shipping_fee, total, payment_method, address_id)
      VALUES ($1, $2, 'preparing', 1000.00, 500.00, 1500.00, 'cod', $3)
      RETURNING id
    `, [orderNo, customerId, addressId]);
    const orderId = orderRes.rows[0].id;
    console.log('Created order:', orderId);

    // 5. Insert order item with the pending batch
    await client.query(`
      INSERT INTO public.order_items (order_id, variant_id, farm_id, batch_id, quantity, unit_price, commission_amount)
      VALUES ($1, (SELECT id FROM public.product_variants LIMIT 1), $2, $3, 1, 1000.00, 100.00)
    `, [orderId, farmId, batchId]);

    // 6. Try to move to 'quality_check' -> Should SUCCEED (this is the correct first step)
    try {
      await client.query("UPDATE public.orders SET status = 'quality_check' WHERE id = $1", [orderId]);
      console.log('✅ Order moved to quality_check.');
    } catch (e) {
      console.log('❌ ERROR: Failed to move to quality_check:', e.message);
    }

    // 7. Try to ship from 'quality_check' with a PENDING batch -> Should FAIL
    let blocked = false;
    try {
      await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
    } catch (e) {
      console.log('✅ Trigger successfully blocked shipping without QC (pending batch).');
      console.log('   Error:', e.message);
      blocked = true;
    }
    if (!blocked) console.log('❌ ERROR: Trigger did not block shipping with pending batch!');

    // 8. Approve the batch and try again -> Should SUCCEED
    await client.query("UPDATE public.batches SET qc_status = 'approved' WHERE id = $1", [batchId]);
    try {
      await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
      console.log('✅ Order successfully shipped with approved batch.');
    } catch (e) {
      console.log('❌ ERROR: Failed to ship after approval:', e.message);
    }

    // 9. Try invalid transition -> Should FAIL
    const orderNo2 = 'TEST-ORDER-' + Math.floor(Math.random() * 100000);
    const orderRes2 = await client.query(`
      INSERT INTO public.orders (order_no, customer_id, status, subtotal, shipping_fee, total, payment_method, address_id)
      VALUES ($1, $2, 'placed', 1000.00, 500.00, 1500.00, 'cod', $3)
      RETURNING id
    `, [orderNo2, customerId, addressId]);
    const orderId2 = orderRes2.rows[0].id;

    try {
      await client.query("UPDATE public.orders SET status = 'delivered' WHERE id = $1", [orderId2]);
      console.log('❌ ERROR: Invalid transition allowed!');
    } catch (e) {
      console.log('✅ Trigger successfully blocked invalid transition (placed -> delivered).');
      console.log('   Error:', e.message);
    }

    // Cleanup
    await client.query('DELETE FROM order_items WHERE order_id IN ($1, $2)', [orderId, orderId2]);
    await client.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId, orderId2]);
    await client.query('DELETE FROM batches WHERE id = $1', [batchId]);
    console.log('Cleaned up test data.');

  } catch (e) {
    console.error('❌ QC Test Failed:', e);
  } finally {
    await client.end();
  }
}

run();
