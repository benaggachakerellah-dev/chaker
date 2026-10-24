import { createClient } from '@supabase/supabase-js';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CatalogPage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const isAr = locale === 'ar';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [
    { data: products, error },
    { data: categories }
  ] = await Promise.all([
    supabase.from('products').select('id, name_ar, name_fr, name_en, grade, farms(name_ar, name_fr, name_en), product_variants(price_dzd, package_weight_g)').eq('is_active', true),
    supabase.from('categories').select('*')
  ]);

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-serif font-bold text-[#35251C]">
          {isAr ? 'كتالوج المنتجات' : 'Product Catalog'}
        </h1>
        <p className="text-sm text-gray-600">
          {isAr ? 'تصفح أفاخر التمور الجزائرية الموثقة من أفضل المزارع' : 'Browse verified premium Algerian dates from selected farms'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-6 bg-white border border-[#E7DED1] rounded-lg p-6 h-fit">
          <h3 className="font-serif font-bold text-sm text-[#35251C] uppercase tracking-wide">
            {isAr ? 'التصنيفات' : 'Categories'}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href={`/${locale}/catalog`} className="hover:text-[#35251C] transition font-medium">
                {isAr ? 'جميع الأصناف' : 'All Varieties'}
              </Link>
            </li>
            {categories?.map((cat: any) => (
              <li key={cat.id}>
                <Link href={`/${locale}/catalog?category=${cat.id}`} className="hover:text-[#35251C] transition">
                  {isAr ? cat.name_ar : (cat.name_en || cat.name_ar)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product: any) => {
                const name = isAr ? product.name_ar : (product.name_en || product.name_ar);
                const farmName = isAr ? product.farms?.name_ar : (product.farms?.name_en || product.farms?.name_ar);
                const price = product.product_variants?.[0]?.price_dzd || 0;
                const isPremium = product.grade === 'premium';

                return (
                  <Link
                    key={product.id}
                    href={`/${locale}/product/${product.id}`}
                    className="group bg-white border border-[#E7DED1] rounded-lg p-5 shadow-subtle flex flex-col justify-between hover:border-[#35251C] transition relative overflow-hidden"
                  >
                    {isPremium && (
                      <span className="absolute top-3 right-3 bg-[#626C45] text-white text-[10px] px-2 py-0.5 rounded font-medium z-10">
                        Premium
                      </span>
                    )}
                    <div>
                      <div className="aspect-[4/3] bg-[#F7F3EB] rounded-md mb-4 flex items-center justify-center text-4xl">
                        🌴
                      </div>
                      <span className="text-[11px] font-medium text-[#67402D] uppercase tracking-wide">{farmName || 'Oasis Farm'}</span>
                      <h2 className="font-serif font-bold text-base text-[#35251C] mt-1 group-hover:text-[#67402D] transition">{name}</h2>
                    </div>

                    <div className="mt-6 pt-3 border-t border-[#E7DED1] flex items-center justify-between">
                      <span className="font-bold text-[#35251C] text-sm">{price} DZD</span>
                      <span className="text-xs bg-[#35251C] text-white px-3 py-1.5 rounded font-medium">
                        {isAr ? 'عرض' : 'View'}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-[#E7DED1] rounded-lg">
              <p className="text-sm text-gray-500">{isAr ? 'لم يتم العثور على منتجات مطابقة.' : 'No products found.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
