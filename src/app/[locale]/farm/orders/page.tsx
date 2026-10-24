import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { updateOrderStatus } from '@/modules/notifications/actions';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FarmOrdersPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: farm } = await supabase.from('farms').select('*').eq('owner_id', user.id).single();
  const farmId = farm?.id;

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, orders(*)')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <Link href={`/${locale}/farm/dashboard`} className="text-xs font-medium text-[#67402D] hover:underline">
          ← {isAr ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#35251C] mt-2">
          {isAr ? 'طلبات المزرعة' : 'Farm Orders'}
        </h1>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle space-y-6">
        {orderItems && orderItems.length > 0 ? (
          <div className="divide-y divide-[#E7DED1]">
            {orderItems.map((item: any) => {
              const order = item.orders;
              if (!order) return null;

              return (
                <div key={item.id} className="py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm">
                  <div>
                    <div className="font-bold text-[#35251C] text-base">Order #{order.order_no}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isAr ? 'الكمية:' : 'Qty:'} {item.quantity} | {isAr ? 'المبلغ:' : 'Total:'} {(item.unit_price * item.quantity).toFixed(2)} DZD
                    </div>
                    <div className="text-xs font-medium text-[#67402D] mt-1">
                      {isAr ? 'الحالة الحالية:' : 'Current Status:'} <span className="uppercase">{order.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={async () => {
                      'use server';
                      await updateOrderStatus(order.id, 'preparing');
                    }} className="inline">
                      <button type="submit" className="text-xs bg-[#F7F3EB] border border-[#E7DED1] text-[#35251C] px-3 py-1.5 rounded font-medium hover:bg-white transition">
                        Preparing
                      </button>
                    </form>
                    <form action={async () => {
                      'use server';
                      await updateOrderStatus(order.id, 'quality_check');
                    }} className="inline">
                      <button type="submit" className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded font-medium hover:bg-amber-100 transition">
                        QC Check
                      </button>
                    </form>
                    <form action={async () => {
                      'use server';
                      await updateOrderStatus(order.id, 'shipped');
                    }} className="inline">
                      <button type="submit" className="text-xs bg-[#35251C] text-white px-3 py-1.5 rounded font-medium hover:bg-[#35251C]/90 transition">
                        Shipped
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-500 py-6 text-center">{isAr ? 'لا توجد طلبات مرتبطة بمزارعك.' : 'No orders found for this farm.'}</p>
        )}
      </div>
    </div>
  );
}
