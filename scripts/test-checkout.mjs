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
  console.log('--- START TEST CHECKOUT VERIFICATION ---');

  // 1. Get test profile
  const profileRes = await client.query("SELECT id FROM public.profiles LIMIT 1");
  const customerId = profileRes.rows[0].id;

  // 2. Get variant and initial stock
  const variantRes = await client.query("SELECT id, stock_qty, price_dzd FROM public.product_variants LIMIT 1");
  const variant = variantRes.rows[0];
  console.log(`Initial stock for variant ${variant.id}: ${variant.stock_qty}`);

  // 3. Cart setup
  let cartRes = await client.query("SELECT id FROM public.carts WHERE user_id = $1", [customerId]);
  let cartId = cartRes.rows.length > 0 ? cartRes.rows[0].id : (await client.query("INSERT INTO public.carts (user_id) VALUES ($1) RETURNING id", [customerId])).rows[0].id;

  await client.query("DELETE FROM public.cart_items WHERE cart_id = $1", [cartId]);
  await client.query("INSERT INTO public.cart_items (cart_id, product_variant_id, quantity) VALUES ($1, $2, 2)", [cartId, variant.id]);
  console.log('Added 2 items to cart.');

  // 4. Place order simulation (Server Action logic)
  await client.query('BEGIN');
  const subtotal = variant.price_dzd * 2;
  const shippingFee = 500.00;
  const totalAmount = subtotal + shippingFee;
  const orderNo = 'TEST-ORD-' + Math.floor(1000 + Math.random() * 9000);

  const orderRes = await client.query(`
    INSERT INTO public.orders (customer_id, order_no, status, subtotal, shipping_fee, total_amount, currency, payment_method, payment_status, shipping_address)
    VALUES ($1, $2, 'placed', $3, $4, $5, 'DZD', 'cod', 'pending', '{"fullName": "Test User", "phone": "+2135550000"}')
    RETURNING id, order_no;
  `, [customerId, orderNo, subtotal, shippingFee, totalAmount]);

  const orderId = orderRes.rows[0].id;
  const prodRef = await client.query("SELECT product_id FROM public.product_variants WHERE id = $1", [variant.id]);
  const productId = prodRef.rows[0].product_id;
  const farmRef = await client.query("SELECT farm_id FROM public.products WHERE id = $1", [productId]);
  const farmId = farmRef.rows[0].farm_id;

  await client.query(`
    INSERT INTO public.order_items (order_id, product_id, product_variant_id, farm_id, quantity, unit_price, commission_amount)
    VALUES ($1, $2, $3, $4, 2, $5, $6);
  `, [orderId, productId, variant.id, farmId, 2, variant.price_dzd, subtotal * 0.10]);

  await client.query(`
    INSERT INTO public.order_events (order_id, status, note)
    VALUES ($1, 'placed', 'Order created by test-checkout script');
  `, [orderId]);

  await client.query("UPDATE public.product_variants SET stock_qty = stock_qty - 2 WHERE id = $1", [variant.id]);
  await client.query("DELETE FROM public.cart_items WHERE cart_id = $1", [cartId]);
  await client.query('COMMIT');

  console.log(`Order placed successfully: ${orderRes.rows[0].order_no}`);

  // 5. Database queries verification
  console.log('\n--- VERIFICATION QUERIES ---');
  const q1 = await client.query("SELECT order_no, status, total_amount, payment_method FROM orders ORDER BY created_at DESC LIMIT 1;");
  console.log('Query 1 (Latest Order):', q1.rows[0]);

  const q2 = await client.query("SELECT count(*) FROM order_items;");
  console.log('Query 2 (Order Items Count):', q2.rows[0].count);

  const q3 = await client.query("SELECT count(*) FROM order_events;");
  console.log('Query 3 (Order Events Count):', q3.rows[0].count);

  const q4 = await client.query("SELECT stock_qty FROM product_variants ORDER BY created_at ASC LIMIT 1;");
  console.log('Query 4 (Stock Qty of first variant):', q4.rows[0].stock_qty);

  const q5 = await client.query("SELECT count(*) FROM cart_items;");
  console.log('Query 5 (Cart Items Count):', q5.rows[0].count);

  console.log('--- END TEST CHECKOUT VERIFICATION ---');
  await client.end();
}

run();
