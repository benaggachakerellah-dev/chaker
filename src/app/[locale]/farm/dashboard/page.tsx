import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FarmDashboardPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: farm } = await supabase.from('farms').select('*').eq('owner_id', user.id).single();
  const farmId = farm?.id;

  const [
    { count: productCount },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('farm_id', farmId),
    supabase.from('order_items').select('*, orders(*)').eq('farm_id', farmId).limit(5)
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#35251C]">
            {isAr ? 'لوحة تحكم المزرعة' : 'Farm Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {farm ? farm.name : (isAr ? 'إدارة المزرعة والمنتجات' : 'Manage your farm and products')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${locale}/farm/products`} className="bg-[#35251C] text-white px-4 py-2 rounded-lg text-xs font-medium">
            {isAr ? 'إدارة المنتجات' : 'Manage Products'}
          </Link>
          <Link href={`/${locale}/farm/orders`} className="bg-[#67402D] text-white px-4 py-2 rounded-lg text-xs font-medium">
            {isAr ? 'طلبات المزرعة' : 'Farm Orders'}
          </Link>
          <Link href={`/${locale}/farm/settings`} className="border border-[#E7DED1] bg-white text-[#35251C] px-4 py-2 rounded-lg text-xs font-medium">
            {isAr ? 'الإعدادات' : 'Settings'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle">
          <div className="text-xs font-medium text-gray-500">{isAr ? 'إجمالي المنتجات' : 'Total Products'}</div>
          <div className="text-3xl font-serif font-bold text-[#35251C] mt-2">{productCount || 0}</div>
        </div>
        <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle">
          <div className="text-xs font-medium text-gray-500">{isAr ? 'حالة المزرعة' : 'Farm Status'}</div>
          <div className="text-2xl font-serif font-bold text-[#626C45] mt-2 capitalize">{farm?.status || 'Pending'}</div>
        </div>
        <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle">
          <div className="text-xs font-medium text-gray-500">{isAr ? 'نسبة العمولة' : 'Commission Rate'}</div>
          <div className="text-3xl font-serif font-bold text-[#35251C] mt-2">{(Number(farm?.commission_rate || 0.10) * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle space-y-4">
        <h2 className="font-serif font-bold text-lg text-[#35251C] border-b border-[#E7DED1] pb-3">
          {isAr ? 'أحدث الطلبات المرتبطة بالمزرعة' : 'Recent Farm Orders'}
        </h2>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="divide-y divide-[#E7DED1]">
            {recentOrders.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <div className="font-bold text-[#35251C]">Order #{item.orders?.order_no}</div>
                  <div className="text-xs text-gray-500">Qty: {item.quantity} | Status: {item.orders?.status}</div>
                </div>
                <Link href={`/${locale}/farm/orders`} className="text-xs text-[#67402D] font-medium hover:underline">
                  {isAr ? 'إدارة الطلب ←' : 'Manage →'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">{isAr ? 'لا توجد طلبات حديثة.' : 'No recent orders.'}</p>
        )}
      </div>
    </div>
  );
}
