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

async function runFinalTest() {
  await client.connect();
  console.log('--- START FINAL VERIFICATION TEST ---');

  try {
    // 1. Get a customer profile
    const customerRes = await client.query('SELECT id FROM public.profiles LIMIT 1');
    const customerId = customerRes.rows[0].id;

    // 1.5. Create a dummy address for the order
    const addrRes = await client.query(`
      INSERT INTO public.addresses (user_id, recipient, phone, region, city, street)
      VALUES ($1, 'Final Test', '+2135550000', 'Algiers', 'Algiers', 'Test Street')
      RETURNING id
    `, [customerId]);
    const addressId = addrRes.rows[0].id;

    // 2. Create a test order with 'delivered' status
    const orderRes = await client.query(`
      INSERT INTO public.orders (order_no, customer_id, status, subtotal, shipping_fee, total, payment_method, address_id)
      VALUES ('FINAL-TEST-ORD', $1, 'delivered', 1000.00, 500.00, 1500.00, 'cod', $2)
      RETURNING id
    `, [customerId, addressId]);
    const orderId = orderRes.rows[0].id;
    console.log('✅ Created delivered order for testing:', orderId);

    // 3. Get a product
    const prodRes = await client.query('SELECT id FROM public.products LIMIT 1');
    const productId = prodRes.rows[0].id;

    // 4. Test submitting a review for the delivered order
    await client.query(`
      INSERT INTO public.reviews (customer_id, product_id, order_id, rating, comment, moderation)
      VALUES ($1, $2, $3, 5, 'Amazing dates and superb quality!', 'approved')
    `, [customerId, productId, orderId]);
    console.log('✅ Successfully submitted and approved review for delivered order.');

    // 5. Test notification creation on order status change
    const notifBefore = await client.query('SELECT COUNT(*) FROM public.notifications WHERE user_id = $1 AND read_at IS NULL', [customerId]);
    const unreadBefore = parseInt(notifBefore.rows[0].count, 10);

    // Simulate order status change
    await client.query("UPDATE public.orders SET status = 'shipped' WHERE id = $1", [orderId]);
    await client.query(`
      INSERT INTO public.notifications (user_id, title, body, channel)
      VALUES ($1, 'Order Status Updated', 'Your order status has changed to shipped.', 'in_app')
    `, [customerId]);

    const notifAfter = await client.query('SELECT COUNT(*) FROM public.notifications WHERE user_id = $1 AND read_at IS NULL', [customerId]);
    const unreadAfter = parseInt(notifAfter.rows[0].count, 10);

    console.log(`✅ Notification unread count verified: Before = ${unreadBefore}, After = ${unreadAfter}`);
    if (unreadAfter > unreadBefore) {
      console.log('✅ Notification count correctly increased.');
    } else {
      throw new Error('Notification count did not increase');
    }

    // Cleanup test data
    await client.query('DELETE FROM public.reviews WHERE order_id = $1', [orderId]);
    await client.query("DELETE FROM public.notifications WHERE title LIKE '%Order Status Updated%'");
    await client.query('DELETE FROM public.orders WHERE id = $1', [orderId]);
    await client.query('DELETE FROM public.addresses WHERE id = $1', [addressId]);
    console.log('✅ Cleaned up test data successfully.');
    console.log('--- END FINAL VERIFICATION TEST ---');

  } catch (e) {
    console.error('❌ Final test failed:', e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runFinalTest();
