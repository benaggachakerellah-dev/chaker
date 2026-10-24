import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FarmDashboardPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}`);

  // Get farm owned by user
  const { data: farm } = await supabase
    .from('farms')
    .select('id, name_ar, name_fr, name_en')
    .eq('owner_id', user.id)
    .single();

  // If user is admin, they can view all farm orders or pick first farm
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  let farmId = farm?.id;
  if (!farmId && profile?.role === 'admin') {
    const { data: firstFarm } = await supabase.from('farms').select('id').limit(1).single();
    farmId = firstFarm?.id;
  }

  if (!farmId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">No Farm Associated with this Account</h1>
      </div>
    );
  }

  // Fetch orders containing order_items for this farm
  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      *,
      orders (*)
    `)
    .eq('farm_id', farmId);

  // Group unique orders
  const ordersMap = new Map();
  orderItems?.forEach(item => {
    if (item.orders) {
      ordersMap.set(item.orders.id, item.orders);
    }
  });
  const farmOrders = Array.from(ordersMap.values());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-desert-dark">{t('farm.title', locale)}</h1>
        <p className="text-gray-600 mt-2">Manage incoming orders, assign batches, and send items to quality control.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-serif font-bold text-xl mb-6 text-gray-900">{t('farm.orders', locale)}</h2>
        {!farmOrders || farmOrders.length === 0 ? (
          <p className="text-gray-500 py-4">No incoming orders for this farm yet.</p>
        ) : (
          <div className="space-y-4">
            {farmOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-desert-gold transition">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{order.order_no}</span>
                    <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium capitalize">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Date: {new Date(order.created_at).toLocaleDateString()} | Total: {order.total_amount} DZD</div>
                </div>
                <Link
                  href={`/${locale}/farm/orders/${order.id}`}
                  className="bg-desert-dark text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-desert-dark/90 transition"
                >
                  Manage Order
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
