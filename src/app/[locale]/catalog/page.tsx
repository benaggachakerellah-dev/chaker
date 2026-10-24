import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string; search?: string };
}) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  // Fetch categories for filter
  const { data: categories } = await supabase.from('categories').select('*');

  // Fetch products with farm, category and variants
  let query = supabase.from('products').select(`
    *,
    farms (name_ar, name_fr, name_en, location),
    categories (slug, name_ar, name_fr, name_en),
    product_variants (id, weight_grams, price_dzd, stock_qty)
  `).eq('is_active', true);

  if (searchParams.category) {
    const cat = categories?.find(c => c.slug === searchParams.category);
    if (cat) {
      query = query.eq('category_id', cat.id);
    }
  }

  const { data: products, error } = await query;

  const filteredProducts = products?.filter(p => {
    if (!searchParams.search) return true;
    const term = searchParams.search.toLowerCase();
    const name = locale === 'fr' ? p.name_fr : locale === 'en' ? p.name_en : p.name_ar;
    return name?.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-desert-dark">{t('catalog.title', locale)}</h1>
        <p className="text-gray-600 mt-2">{t('catalog.subtitle', locale)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="font-bold text-lg mb-4">{t('catalog.filterBy', locale)}</h2>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{t('catalog.category', locale)}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/catalog`} className={`text-sm hover:text-desert-gold transition ${!searchParams.category ? 'font-bold text-desert-gold' : 'text-gray-600'}`}>
                  {locale === 'ar' ? 'جميع التصنيفات' : 'All Categories'}
                </Link>
              </li>
              {categories?.map(cat => {
                const catName = locale === 'fr' ? cat.name_fr : locale === 'en' ? cat.name_en : cat.name_ar;
                const isSelected = searchParams.category === cat.slug;
                return (
                  <li key={cat.id}>
                    <Link href={`/${locale}/catalog?category=${cat.slug}`} className={`text-sm hover:text-desert-gold transition ${isSelected ? 'font-bold text-desert-gold' : 'text-gray-600'}`}>
                      {catName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <form method="GET" className="flex gap-2">
              <input
                type="text"
                name="search"
                defaultValue={searchParams.search || ''}
                placeholder={t('catalog.search', locale)}
                className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-desert-gold"
              />
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              <button type="submit" className="bg-desert-gold text-white px-6 py-2 rounded-lg font-medium hover:bg-desert-gold/90 transition">
                {locale === 'ar' ? 'بحث' : 'Search'}
              </button>
            </form>
          </div>

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => {
                const productName = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
                const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;
                const minPrice = product.product_variants?.[0]?.price_dzd || 0;

                return (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                    <div className="h-48 bg-amber-50 flex items-center justify-center relative">
                      <span className="text-4xl">🌴</span>
                      {product.data_source === 'synthetic' && (
                        <span className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
                          {t('catalog.synthetic', locale)}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <span className="text-xs text-desert-gold font-medium mb-1">{farmName}</span>
                      <h3 className="font-serif font-bold text-lg mb-2 text-gray-900">{productName}</h3>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-xs text-gray-500 block">{t('catalog.price', locale)}</span>
                          <span className="font-bold text-desert-dark">{minPrice} DZD</span>
                        </div>
                        <Link href={`/${locale}/product/${product.id}`} className="bg-desert-dark text-white text-sm px-4 py-2 rounded-lg hover:bg-desert-dark/90 transition">
                          {t('catalog.viewDetails', locale)}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">{t('catalog.noProducts', locale)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
