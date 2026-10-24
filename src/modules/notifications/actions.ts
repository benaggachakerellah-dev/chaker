'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Fetch current order to get customer_id and old status
  const { data: order } = await supabase
    .from('orders')
    .select('customer_id, status, order_no')
    .eq('id', orderId)
    .single();

  if (!order) throw new Error('Order not found');

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);

  if (error) throw new Error(error.message);

  // Insert order event
  await supabase.from('order_events').insert({
    order_id: orderId,
    status: newStatus,
    note: `Status updated from ${order.status} to ${newStatus}`
  });

  // Insert notification for customer
  await supabase.from('notifications').insert({
    user_id: order.customer_id,
    title: `Order Status Updated: ${order.order_no}`,
    message: `Your order status has changed to "${newStatus.replace('_', ' ')}".`,
    is_read: false
  });

  revalidatePath('/[locale]/account/orders');
  revalidatePath('/[locale]/account/notifications');
}
