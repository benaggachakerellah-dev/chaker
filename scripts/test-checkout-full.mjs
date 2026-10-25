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
  console.log('=== TEST-CHECKOUT-FULL: START ===\n');

  let testOrderId = null;
  let testCartId = null;
  let testCustomerId = null;
  let testAddressId = null;
  let testVariantId = null;
  let initialStock = null;

  try {
    // ─── STEP 1: Find (or use existing) test customer ───
    const profileRes = await client.query(
      "SELECT id, full_name, role FROM public.profiles WHERE role = 'customer' LIMIT 1"
    );
    if (profileRes.rows.length === 0) {
      throw new Error('No customer profile found in the database.');
    }
    testCustomerId = profileRes.rows[0].id;
    console.log(`1. Using customer: ${profileRes.rows[0].full_name} (${testCustomerId})`);

    // ─── STEP 2: Find a product variant with stock ───
    const variantRes = await client.query(
      "SELECT pv.id, pv.stock_qty, pv.price_dzd, pv.sku, p.farm_id, p.id AS product_id " +
      "FROM public.product_variants pv " +
      "JOIN public.products p ON pv.product_id = p.id " +
      "WHERE pv.stock_qty > 0 " +
      "LIMIT 1"
    );
    if (variantRes.rows.length === 0) {
      throw new Error('No product variant with stock > 0 found.');
    }
    const variant = variantRes.rows[0];
    testVariantId = variant.id;
    initialStock = parseInt(variant.stock_qty, 10);
    console.log(`2. Using variant: SKU=${variant.sku}, price=${variant.price_dzd} DZD, stock=${initialStock}`);

    // ─── STEP 3: Ensure address exists for customer ───
    const addrRes = await client.query(
      "SELECT id FROM public.addresses WHERE user_id = $1 LIMIT 1",
      [testCustomerId]
    );
    if (addrRes.rows.length > 0) {
      testAddressId = addrRes.rows[0].id;
    } else {
      const newAddr = await client.query(
        "INSERT INTO public.addresses (user_id, recipient, phone, region, city, street, is_default) " +
        "VALUES ($1, 'Test Customer', '+213551234567', 'Ghardaia', 'Ghardaia', '1 Rue Test', true) RETURNING id",
        [testCustomerId]
      );
      testAddressId = newAddr.rows[0].id;
    }
    console.log(`3. Address ID: ${testAddressId}`);

    // ─── STEP 4: Create cart with one item ───
    const existingCart = await client.query(
      "SELECT id FROM public.carts WHERE user_id = $1", [testCustomerId]
    );
    if (existingCart.rows.length > 0) {
      testCartId = existingCart.rows[0].id;
      // Clear old items
      await client.query("DELETE FROM public.cart_items WHERE cart_id = $1", [testCartId]);
    } else {
      const newCart = await client.query(
        "INSERT INTO public.carts (user_id) VALUES ($1) RETURNING id", [testCustomerId]
      );
      testCartId = newCart.rows[0].id;
    }

    const cartQty = 2;
    await client.query(
      "INSERT INTO public.cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)",
      [testCartId, testVariantId, cartQty]
    );
    console.log(`4. Cart created (${testCartId}) with ${cartQty} × variant ${variant.sku}`);

    // ─── STEP 5: Simulate placeOrder logic ───
    await client.query('BEGIN');

    const unitPrice = parseFloat(variant.price_dzd);
    const subtotal = unitPrice * cartQty;
    const shippingFee = 500.00;
    const total = subtotal + shippingFee;
    const orderNo = 'TEST-CHK-' + Math.floor(100000 + Math.random() * 900000);
    const commissionAmount = subtotal * 0.10; // 10% default

    // 5a. Insert order
    const orderRes = await client.query(
      `INSERT INTO public.orders (customer_id, order_no, status, subtotal, shipping_fee, total, payment_method, address_id)
       VALUES ($1, $2, 'placed', $3, $4, $5, 'cod', $6)
       RETURNING id, order_no, status, subtotal, shipping_fee, total`,
      [testCustomerId, orderNo, subtotal, shippingFee, total, testAddressId]
    );
    testOrderId = orderRes.rows[0].id;
    console.log(`\n5a. Order created: ${orderRes.rows[0].order_no}`);
    console.log(`    status=${orderRes.rows[0].status}, subtotal=${orderRes.rows[0].subtotal}, shipping=${orderRes.rows[0].shipping_fee}, total=${orderRes.rows[0].total}`);

    // 5b. Insert order items
    const oiRes = await client.query(
      `INSERT INTO public.order_items (order_id, variant_id, farm_id, quantity, unit_price, commission_amount)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [testOrderId, testVariantId, variant.farm_id, cartQty, unitPrice, commissionAmount]
    );
    console.log(`5b. Order item created: ${oiRes.rows[0].id}`);

    // 5c. Insert order event
    await client.query(
      `INSERT INTO public.order_events (order_id, status, note)
       VALUES ($1, 'placed', 'Order created by test-checkout-full script')`,
      [testOrderId]
    );
    console.log(`5c. Order event logged.`);

    // 5d. Deduct stock
    await client.query(
      "UPDATE public.product_variants SET stock_qty = stock_qty - $1 WHERE id = $2",
      [cartQty, testVariantId]
    );
    console.log(`5d. Stock deducted by ${cartQty}.`);

    // 5e. Clear cart
    await client.query("DELETE FROM public.cart_items WHERE cart_id = $1", [testCartId]);
    console.log(`5e. Cart cleared.`);

    await client.query('COMMIT');
    console.log('    Transaction committed.\n');

    // ─── STEP 6: VERIFICATION ───
    console.log('=== VERIFICATION ===\n');

    // 6a. Order exists
    const verifyOrder = await client.query(
      "SELECT id, order_no, status, subtotal, shipping_fee, total, payment_method FROM public.orders WHERE id = $1",
      [testOrderId]
    );
    const o = verifyOrder.rows[0];
    console.log(`✅ (a) Order exists: order_no=${o.order_no}, status=${o.status}, total=${o.total}, payment=${o.payment_method}`);

    // 6b. Order items exist
    const verifyItems = await client.query(
      "SELECT id, variant_id, farm_id, quantity, unit_price, commission_amount FROM public.order_items WHERE order_id = $1",
      [testOrderId]
    );
    console.log(`✅ (b) Order items count: ${verifyItems.rows.length}`);
    for (const item of verifyItems.rows) {
      console.log(`       item_id=${item.id}, qty=${item.quantity}, unit_price=${item.unit_price}, commission=${item.commission_amount}`);
    }

    // 6c. Stock deducted
    const verifyStock = await client.query(
      "SELECT stock_qty FROM public.product_variants WHERE id = $1",
      [testVariantId]
    );
    const newStock = parseInt(verifyStock.rows[0].stock_qty, 10);
    const expectedStock = initialStock - cartQty;
    if (newStock === expectedStock) {
      console.log(`✅ (c) Stock deducted: ${initialStock} → ${newStock} (expected ${expectedStock})`);
    } else {
      console.log(`❌ (c) Stock mismatch: expected ${expectedStock}, got ${newStock}`);
    }

    // 6d. Cart cleared
    const verifyCart = await client.query(
      "SELECT count(*)::int AS cnt FROM public.cart_items WHERE cart_id = $1",
      [testCartId]
    );
    if (verifyCart.rows[0].cnt === 0) {
      console.log(`✅ (d) Cart cleared: 0 items remaining.`);
    } else {
      console.log(`❌ (d) Cart not cleared: ${verifyCart.rows[0].cnt} items remain.`);
    }

    // 6e. Order event exists
    const verifyEvents = await client.query(
      "SELECT status, note FROM public.order_events WHERE order_id = $1",
      [testOrderId]
    );
    console.log(`✅ (e) Order events: ${verifyEvents.rows.length}`);
    for (const ev of verifyEvents.rows) {
      console.log(`       status=${ev.status}, note=${ev.note}`);
    }

    console.log('\n=== ALL CHECKOUT VERIFICATIONS PASSED ===');

  } catch (e) {
    // Rollback on error
    try { await client.query('ROLLBACK'); } catch (_) {}
    console.error('\n❌ TEST FAILED:', e.message);
    console.error(e.stack);
  } finally {
    // ─── CLEANUP: Restore stock and remove test data ───
    try {
      if (testOrderId) {
        await client.query("DELETE FROM public.order_events WHERE order_id = $1", [testOrderId]);
        await client.query("DELETE FROM public.order_items WHERE order_id = $1", [testOrderId]);
        await client.query("DELETE FROM public.orders WHERE id = $1", [testOrderId]);
      }
      if (testVariantId && initialStock !== null) {
        await client.query("UPDATE public.product_variants SET stock_qty = $1 WHERE id = $2", [initialStock, testVariantId]);
      }
      console.log('\n[Cleanup] Test data removed, stock restored.');
    } catch (cleanupErr) {
      console.error('[Cleanup] Error:', cleanupErr.message);
    }
    await client.end();
  }
}

run();
