'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateFarmStatus(farmId: string, status: 'approved' | 'suspended') {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden: Admin access required');

  const { error } = await supabase
    .from('farms')
    .update({ status })
    .eq('id', farmId);

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/admin');
}

export async function updateFarmCommission(farmId: string, commissionRate: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden: Admin access required');

  if (commissionRate < 0.05 || commissionRate > 0.15) {
    throw new Error('Commission rate must be between 5% (0.05) and 15% (0.15)');
  }

  const { error } = await supabase
    .from('farms')
    .update({ commission_rate: commissionRate })
    .eq('id', farmId);

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/admin');
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden: Admin access required');

  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/admin');
}

export async function updatePlatformSetting(key: string, value: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden: Admin access required');

  const { error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/admin');
}

export async function createPayout(farmId: string, amount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden: Admin access required');

  const { error } = await supabase
    .from('payouts')
    .insert({
      farm_id: farmId,
      amount,
      status: 'paid',
      created_at: new Date().toISOString()
    });

  if (error) throw new Error(error.message);
  revalidatePath('/[locale]/admin');
}
