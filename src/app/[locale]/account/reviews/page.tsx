import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CustomerReviewsPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, products(name_ar, name_en)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
      <div>
        <Link href={`/${locale}/account/orders`} className="text-xs font-medium text-[#67402D] hover:underline">
          ← {isAr ? 'العودة إلى الطلبات' : 'Back to Orders'}
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#35251C] mt-2">
          {isAr ? 'تقييماتي' : 'My Reviews'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAr ? 'التقييمات التي قمت بتقديمها للمنتجات السابقة' : 'Reviews you have submitted for past products'}
        </p>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg shadow-subtle divide-y divide-[#E7DED1]">
        {reviews && reviews.length > 0 ? (
          reviews.map((rev: any) => {
            const productName = isAr ? rev.products?.name_ar : (rev.products?.name_en || rev.products?.name_ar);
            return (
              <div key={rev.id} className="p-6 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-base text-[#35251C]">{productName || 'Product'}</h3>
                  <div className="text-amber-600 font-bold text-sm">{'⭐'.repeat(rev.rating)}</div>
                </div>
                <p className="text-sm text-gray-600">{rev.comment}</p>
                <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                  <span>{isAr ? 'الحالة:' : 'Status:'} <span className="font-medium text-[#626C45]">{rev.moderation}</span></span>
                  <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-sm text-gray-500">
            {isAr ? 'لا توجد تقييمات سابقة.' : 'No past reviews found.'}
          </div>
        )}
      </div>
    </div>
  );
}
