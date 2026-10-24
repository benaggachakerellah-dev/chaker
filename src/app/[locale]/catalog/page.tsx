import { createClient } from '@supabase/supabase-js';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CatalogPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;

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
    <div className="max-w-7xl mx-auto px-6 py-12 bg-[#FDFBF7] min-h-screen">
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
        <h1 className="text-4xl font-serif font-bold text-[#3E2723]">
          {locale === 'ar' ? 'كتالوج المنتجات' : 'Product Catalog'}
        </h1>
        <p className="text-gray-600">
          {locale === 'ar' ? 'تصفح أفاخر التمور الجزائرية الموثقة من أفضل المزارع' : 'Browse verified premium Algerian dates from selected farms'}
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product: any) => {
            const name = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
            const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;
            const price = product.product_variants?.[0]?.price_dzd || 0;
            const isPremium = product.grade === 'premium';

            return (
              <Link
                key={product.id}
                href={`/${locale}/product/${product.id}`}
                className="block bg-white rounded-2xl shadow-premium p-6 border border-gray-100 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                {isPremium && (
                  <span className="absolute top-4 right-4 bg-[#D4AF37] text-[#3E2723] text-xs px-3 py-1 rounded-full font-bold shadow-sm z-10">
                    Premium
                  </span>
                )}
                <div className="h-52 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl mb-6 flex items-center justify-center text-6xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                  🌴
                </div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">{farmName || 'Oasis Farm'}</span>
                <h2 className="text-xl font-serif font-bold text-[#3E2723] mt-1">{name}</h2>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#D4AF37]">{price} DZD</span>
                  <span className="text-xs bg-[#3E2723] text-white px-4 py-2 rounded-xl font-medium">
                    {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-premium border border-gray-100">
          <p className="text-gray-500 text-lg">لم يتم العثور على منتجات مطابقة.</p>
        </div>
      )}
    </div>
  );
}
