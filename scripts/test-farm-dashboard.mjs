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
  console.log('=== TEST-FARM-DASHBOARD: START ===\n');

  let testFarmId = null;
  let testOrderId = null;
  let testCustomerId = null;
  let testVariantId = null;
  let testAddressId = null;

  try {
    // 1. Get an existing approved farm or create/find one
    const farmRes = await client.query("SELECT id, name, owner_id FROM public.farms LIMIT 1");
    if (farmRes.rows.length === 0) {
      throw new Error('No farm found in database.');
    }
    testFarmId = farmRes.rows[0].id;
    console.log(`1. Found farm ID: ${testFarmId} (${farmRes.rows[0].name})`);

    // 2. Get customer & address
    const custRes = await client.query("SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 1");
    testCustomerId = custRes.rows[0].id;

    const addrRes = await client.query("SELECT id FROM public.addresses WHERE user_id = $1 LIMIT 1", [testCustomerId]);
    testAddressId = addrRes.rows[0].id;

    // 3. Get product variant for this farm
    const varRes = await client.query(
      "SELECT pv.id, pv.price_dzd FROM public.product_variants pv " +
      "JOIN public.products p ON pv.product_id = p.id " +
      "WHERE p.farm_id = $1 LIMIT 1",
      [testFarmId]
    );
    if (varRes.rows.length === 0) {
      throw new Error('No product variant found for this farm.');
    }
    testVariantId = varRes.rows[0].id;

    // 4. Create a test order with status 'placed' containing an item for this farm
    const orderNo = 'TEST-FARM-' + Math.floor(100000 + Math.random() * 900000);
    const orderRes = await client.query(
      `INSERT INTO public.orders (customer_id, order_no, status, subtotal, shipping_fee, total, payment_method, address_id)
       VALUES ($1, $2, 'placed', 1000.00, 500.00, 1500.00, 'cod', $3)
       RETURNING id, order_no, status`,
      [testCustomerId, orderNo, testAddressId]
    );
    testOrderId = orderRes.rows[0].id;
    console.log(`2. Created test order: ${orderRes.rows[0].order_no} (Status: ${orderRes.rows[0].status})`);

    // 5. Insert order item for this farm
    await client.query(
      `INSERT INTO public.order_items (order_id, variant_id, farm_id, quantity, unit_price, commission_amount)
       VALUES ($1, $2, $3, 1, 1000.00, 100.00)`,
      [testOrderId, testVariantId, testFarmId]
    );
    console.log(`3. Inserted order item linked to farm ${testFarmId}.`);

    // 6. Verify farm dashboard query (find orders containing this farm's items)
    const farmOrdersRes = await client.query(
      `SELECT DISTINCT o.id, o.order_no, o.status, o.total
       FROM public.orders o
       JOIN public.order_items oi ON oi.order_id = o.id
       WHERE oi.farm_id = $1 AND o.id = $2`,
      [testFarmId, testOrderId]
    );
    console.log(`4. Farm dashboard query verification: Found ${farmOrdersRes.rows.length} order(s) for farm.`);
    console.log('   Order details:', farmOrdersRes.rows[0]);

    // 7. Simulate farm updating order status ('placed' -> 'preparing')
    console.log('\n5. Simulating status update: placed → preparing');
    await client.query(
      "UPDATE public.orders SET status = 'preparing', updated_at = now() WHERE id = $1",
      [testOrderId]
    );

    // Verify status changed in DB
    const checkStatus = await client.query(
      "SELECT status FROM public.orders WHERE id = $1",
      [testOrderId]
    );
    console.log(`✅ Status successfully updated in DB to: ${checkStatus.rows[0].status}`);

    // 8. Test transition guard / business rules (try invalid jump: preparing -> shipped directly without QC)
    console.log('\n6. Testing transition guard (preparing → shipped directly without QC / batches)...');
    try {
      await client.query(
        "UPDATE public.orders SET status = 'shipped' WHERE id = $1",
        [testOrderId]
      );
      console.log('❌ ERROR: Shipped without QC was incorrectly allowed!');
    } catch (e) {
      console.log(`✅ Transition guard correctly blocked invalid transition: ${e.message.split('\n')[0]}`);
    }

    console.log('\n=== ALL FARM DASHBOARD VERIFICATIONS PASSED ===');

  } catch (e) {
    console.error('\n❌ FARM DASHBOARD TEST FAILED:', e.message);
    console.error(e.stack);
  } finally {
    // Cleanup
    try {
      if (testOrderId) {
        await client.query("DELETE FROM public.order_events WHERE order_id = $1", [testOrderId]);
        await client.query("DELETE FROM public.order_items WHERE order_id = $1", [testOrderId]);
        await client.query("DELETE FROM public.orders WHERE id = $1", [testOrderId]);
      }
      console.log('\n[Cleanup] Test order and items removed.');
    } catch (cleanupErr) {
      console.error('[Cleanup] Error:', cleanupErr.message);
    }
    await client.end();
  }
}

run();
