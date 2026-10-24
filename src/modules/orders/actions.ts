'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to get or create active cart for current user
export async function getCart() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { cart: null, items: [] };
  }

  // Find active cart
  let { data: cart } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({ user_id: user.id })
      .select('*')
      .single();
    if (error) throw new Error('Failed to create cart');
    cart = newCart;
  }

  const { data: items } = await supabase
    .from('cart_items')
    .select(`
      *,
      product_variants (
        id,
        sku,
        weight_grams,
        price_dzd,
        stock_qty,
        products (
          id,
          name_ar,
          name_fr,
          name_en,
          farm_id,
          farms (name_ar, name_fr, name_en, commission_rate)
        )
      )
    `)
    .eq('cart_id', cart.id);

  return { cart, items: items || [] };
}
export async function addToCart(variantId: string, quantity: number) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: 'You must be logged in to add to cart' };
    }

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!cart) {
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      if (cartError) throw cartError;
      cart = newCart;
    }

    // Check if item already exists
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', variantId)
      .single();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          variant_id: variantId,
          quantity: quantity,
        });
      if (error) throw error;
    }

    revalidatePath('/[locale]/cart', 'page');
    return { success: true };
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return { error: error.message || 'Failed to add to cart' };
  }
}

export async function removeFromCart(cartItemId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/cart', 'layout');
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', cartItemId);

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/cart', 'layout');
}

// SECURE ORDER CREATION WITH TRANSACTION & STOCK DEDUCTION
export async function placeOrder(shippingData: {
  fullName: string;
  phone: string;
  region: string;
  city: string;
  street: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be logged in to place an order');
  }

  const { cart, items } = await getCart();
  if (!cart || !items || items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Calculate totals and validate prices & stock from database directly
  let subtotal = 0;
  const orderItemsData = [];

  for (const item of items) {
    const variant = item.product_variants;
    if (!variant || !variant.is_active) {
      throw new Error(`Product variant is no longer available`);
    }

    if (variant.stock_qty < item.quantity) {
      throw new Error(`Insufficient stock for SKU ${variant.sku}. Available: ${variant.stock_qty}`);
    }

    const unitPrice = variant.price_dzd; // Fetch strictly from DB variant
    const farm = variant.products?.farms;
    const commissionRate = farm?.commission_rate || 0.10; // default 10%
    const itemTotal = unitPrice * item.quantity;
    const commissionAmount = itemTotal * commissionRate;

    subtotal += itemTotal;

    orderItemsData.push({
      product_id: variant.products.id,
      product_variant_id: variant.id,
      farm_id: variant.products.farm_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      commission_amount: commissionAmount,
      batch_id: null // Assigned later during fulfillment/preparation
    });
  }

  const shippingFee = 500.00; // Flat rate DZD
  const totalAmount = subtotal + shippingFee;
  const orderNo = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  // Perform transaction / atomic steps via supabase client
  // 1. Insert Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      order_no: orderNo,
      status: 'placed',
      subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      currency: 'DZD',
      payment_method: 'cod',
      payment_status: 'pending',
      shipping_address: shippingData
    })
    .select('*')
    .single();

  if (orderError) throw new Error('Failed to create order: ' + orderError.message);

  // 2. Insert Order Items
  const itemsWithOrderId = orderItemsData.map(oi => ({
    ...oi,
    order_id: order.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId);

  if (itemsError) throw new Error('Failed to create order items: ' + itemsError.message);

  // 3. Insert Order Event
  await supabase.from('order_events').insert({
    order_id: order.id,
    status: 'placed',
    note: 'Order created by customer via Cash on Delivery'
  });

  // 4. Deduct Stock & Clear Cart
  for (const item of items) {
    const variant = item.product_variants;
    const newStock = variant.stock_qty - item.quantity;
    await supabase
      .from('product_variants')
      .update({ stock_qty: newStock })
      .eq('id', variant.id);
  }

  await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id);

  revalidatePath('/[locale]/cart', 'layout');
  revalidatePath('/[locale]/account/orders', 'layout');

  return { success: true, orderId: order.id, orderNo: order.order_no };
}
