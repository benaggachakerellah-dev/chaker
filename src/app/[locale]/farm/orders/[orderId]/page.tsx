import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { notFound, redirect } from 'next/navigation';
import FarmOrderDetail from '@/components/FarmOrderDetail';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FarmOrderManagePage({ params }: { params: { locale: string; orderId: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}`);

  // Fetch order
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.orderId)
    .single();

  if (error || !order) notFound();

  // Fetch order items for this farm
  const { data: farm } = await supabase.from('farms').select('id').eq('owner_id', user.id).single();
  const farmId = farm?.id || (await supabase.from('farms').select('id').limit(1).single()).data?.id;

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .eq('farm_id', farmId);

  // Fetch approved batches for this farm
  const { data: approvedBatches } = await supabase
    .from('batches')
    .select('*')
    .eq('farm_id', farmId)
    .eq('qc_status', 'approved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <FarmOrderDetail order={order} items={items || []} approvedBatches={approvedBatches || []} locale={locale} />
    </div>
  );
}
