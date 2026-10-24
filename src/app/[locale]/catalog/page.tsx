import { createClient } from '@supabase/supabase-js';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CatalogPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  
  // استخدام Supabase Client المباشر (وليس SSR) لضمان جلب البيانات
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name_ar,
      name_fr,
      name_en,
      grade,
      farms (name_ar, name_fr, name_en),
      product_variants (price_dzd, package_weight_g)
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 bg-[#FDFBF7] min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-[#3E2723]">كتالوج المنتجات</h1>
      
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const name = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
            const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;
            const price = product.product_variants?.[0]?.price_dzd || 0;
            return (
              <Link key={product.id} href={`/${locale}/product/${product.id}`} className="block border rounded-xl p-4 hover:shadow-lg transition bg-white">
                <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400 text-sm">صورة المنتج</div>
                <h2 className="text-xl font-bold text-[#3E2723]">{name}</h2>
                <p className="text-gray-600 mt-1">{farmName}</p>
                <p className="text-lg font-bold text-[#D4AF37] mt-2">{price} DZD</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">لم يتم العثور على منتجات مطابقة.</p>
      )}
    </div>
  );
}