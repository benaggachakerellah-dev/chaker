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
  console.log('--- TEST CHECKOUT SCRIPT EXECUTION ---');

  // 1. Get test profile
  const profileRes = await client.query("SELECT id FROM public.profiles LIMIT 1");
  const customerId = profileRes.rows[0].id;

  // 2. Get variant
  const variantRes = await client.query("SELECT id, stock_qty, price_dzd FROM public.product_variants LIMIT 1");
  const variant = variantRes.rows[0];
  console.log(`Initial stock for variant ${variant.id}: ${variant.stock_qty}`);

  // 3. Cart setup
  let cartRes = await client.query("SELECT id FROM public.carts WHERE user_id = $1", [customerId]);
  let cartId = cartRes.rows.length > 0 ? cartRes.rows[0].id : (await client.query("INSERT INTO public.carts (user_id) VALUES ($1) RETURNING id", [customerId])).rows[0].id;

  await client.query("DELETE FROM public.cart_items WHERE cart_id = $1", [cartId]);
  await client.query("INSERT INTO public.cart_items (cart_id, product_variant_id, quantity) VALUES ($1, $2, 2)", [cartId, variant.id]);

  // 4. Place order simulation
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
  `, [orderId, productId, variant.id, farmId, variant.price_dzd, subtotal * 0.10]);

  await client.query("UPDATE public.product_variants SET stock_qty = stock_qty - 2 WHERE id = $1", [variant.id]);
  await client.query("DELETE FROM public.cart_items WHERE cart_id = $1", [cartId]);
  await client.query('COMMIT');

  const finalVariant = await client.query("SELECT stock_qty FROM public.product_variants WHERE id = $1", [variant.id]);
  const cartCheck = await client.query("SELECT count(*) FROM public.cart_items WHERE cart_id = $1", [cartId]);
  const orderCheck = await client.query("SELECT count(*) FROM public.orders WHERE id = $1", [orderId]);

  console.log(`Final stock for variant: ${finalVariant.rows[0].stock_qty}`);
  console.log(`Cart items remaining: ${cartCheck.rows[0].count}`);
  console.log(`Orders created in DB: ${orderCheck.rows[0].count}`);
  console.log('--- TEST CHECKOUT SCRIPT END ---');

  await client.end();
}

run();
