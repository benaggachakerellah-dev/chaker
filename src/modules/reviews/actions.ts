'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReview(orderId: string, productId: string, rating: number, comment: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Verify order belongs to user and is delivered
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('customer_id', user.id)
    .single();

  if (!order || order.status !== 'delivered') {
    throw new Error('You can only review delivered orders.');
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      customer_id: user.id,
      product_id: productId,
      order_id: orderId,
      rating,
      comment,
      moderation: 'pending'
    });

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/account/orders/' + orderId);
  revalidatePath('/[locale]/product/' + productId);
}
