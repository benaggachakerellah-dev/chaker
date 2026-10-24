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

async function testQCWorkflow() {
  await client.connect();
  console.log('✅ Connected to database for QC workflow testing');

  try {
    await client.query('BEGIN');

    // 1. Get farm and customer profile
    const farmRes = await client.query("SELECT id FROM public.farms LIMIT 1");
    const farmId = farmRes.rows[0].id;

    const profileRes = await client.query("SELECT id FROM public.profiles LIMIT 1");
    const customerId = profileRes.rows[0].id;

    // 2. Create a batch with status 'pending'
    const batchRes = await client.query(`
      INSERT INTO public.batches (batch_number, farm_id, quantity, remaining_qty, unit, qc_status, data_source)
      VALUES ('QC-TEST-BATCH-001', $1, 200, 200, 'kg', 'pending', 'synthetic')
      RETURNING id;
    `, [farmId]);
    const batchId = batchRes.rows[0].id;
    console.log(`Created pending batch: ${batchId}`);

    // 3. Create an order and order_item linked to this batch
    const orderRes = await client.query(`
      INSERT INTO public.orders (customer_id, order_no, status, subtotal, shipping_fee, total_amount, currency, payment_method, shipping_address)
      VALUES ($1, 'QC-ORD-999', 'preparing', 2000.00, 500.00, 2500.00, 'DZD', 'cod', '{"fullName": "QC Test"}')
      RETURNING id;
    `, [customerId]);
    const orderId = orderRes.rows[0].id;

    const prodRes = await client.query("SELECT id FROM public.products WHERE farm_id = $1 LIMIT 1", [farmId]);
    const productId = prodRes.rows[0].id;

    await client.query(`
      INSERT INTO public.order_items (order_id, product_id, farm_id, quantity, unit_price, batch_id)
      VALUES ($1, $2, $3, 10, 200.00, $4);
    `, [orderId, productId, farmId, batchId]);

    // 4. Attempt to move order to 'quality_check' with a PENDING batch -> Should FAIL (trigger guard)
    let triggerFailedAsExpected = false;
    try {
      await client.query("UPDATE public.orders SET status = 'quality_check' WHERE id = $1", [orderId]);
    } catch (err) {
      if (err.message.includes('not approved')) {
        triggerFailedAsExpected = true;
        console.log('✅ Trigger successfully blocked moving order to quality_check with pending batch: ' + err.message);
      } else {
        console.log('⚠️ Unexpected error:', err.message);
      }
    }

    if (!triggerFailedAsExpected) {
      throw new Error('FAIL: Trigger did not block order transition with pending batch!');
    }

    // 5. Update batch to 'approved' (simulate successful QC inspection)
    await client.query("UPDATE public.batches SET qc_status = 'approved' WHERE id = $1", [batchId]);
    console.log('Batch updated to approved via QC inspection.');

    // 6. Now move order to 'quality_check' -> Should SUCCEED
    await client.query("UPDATE public.orders SET status = 'quality_check' WHERE id = $1", [orderId]);
    console.log('✅ Order successfully moved to quality_check with approved batch.');

    // 7. Move order to 'shipped' -> Should SUCCEED
    await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
    console.log('✅ Order successfully moved to shipped.');

    await client.query('COMMIT');
    console.log('✅ QC workflow test completed successfully.');

    // Cleanup
    await client.query("DELETE FROM public.order_items WHERE order_id = $1", [orderId]);
    await client.query("DELETE FROM public.orders WHERE id = $1", [orderId]);
    await client.query("DELETE FROM public.batches WHERE id = $1", [batchId]);
    console.log('Cleaned up test data.');

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ QC workflow test failed:', e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testQCWorkflow();
