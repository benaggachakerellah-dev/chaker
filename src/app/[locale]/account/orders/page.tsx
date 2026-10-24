import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OrdersPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product_variants (
          sku,
          products (name_ar, name_fr, name_en)
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-serif font-bold text-desert-dark mb-8">{t('orders.title', locale)}</h1>

      {!orders || orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg mb-6">{t('orders.noOrders', locale)}</p>
          <Link href={`/${locale}/catalog`} className="bg-desert-gold text-white px-8 py-3 rounded-xl font-medium hover:bg-desert-gold/90 transition inline-block">
            {t('common.catalog', locale)}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-lg text-gray-900">{order.order_no}</span>
                  <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString()} | {order.total_amount} DZD ({order.payment_method.toUpperCase()})
                </div>
              </div>
              <Link
                href={`/${locale}/account/orders/${order.id}`}
                className="bg-desert-dark text-white text-sm px-6 py-2 rounded-xl hover:bg-desert-dark/90 transition text-center"
              >
                {t('orders.details', locale)}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
