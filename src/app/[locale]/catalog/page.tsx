import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CatalogPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const supabase = createClient();

  // Fetch products with their farm and category
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name_ar,
      name_fr,
      name_en,
      grade,
      description_ar,
      description_fr,
      description_en,
      farms (name_ar, name_fr, name_en),
      categories (name_ar, name_fr, name_en),
      product_variants (price_dzd, weight_grams)
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-serif font-bold text-primary">{t('catalog.title', locale) || 'Product Catalog'}</h1>
        <p className="text-gray-600">{t('catalog.subtitle', locale) || 'Browse verified premium Algerian dates from selected farms'}</p>
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
                className="bg-white rounded-2xl shadow-premium p-6 border border-gray-100 flex flex-col justify-between hover:scale-105 transition duration-300 relative overflow-hidden"
              >
                {isPremium && (
                  <span className="absolute top-4 right-4 bg-secondary text-primary text-xs px-3 py-1 rounded-full font-bold shadow-sm">
                    Premium
                  </span>
                )}
                <div>
                  <div className="h-48 bg-amber-50 rounded-xl mb-6 flex items-center justify-center text-5xl shadow-inner">
                    🌴
                  </div>
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{farmName || 'Oasis Farm'}</span>
                  <h2 className="text-xl font-serif font-bold text-primary mt-1">{name}</h2>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xl font-bold text-secondary">{price} DZD</span>
                  <span className="text-xs bg-primary text-white px-4 py-2 rounded-xl font-medium">
                    View Details
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">لم يتم العثور على منتجات مطابقة.</p>
        </div>
      )}
    </div>
  );
}
