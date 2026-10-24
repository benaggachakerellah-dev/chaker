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
      description,
      farms (name_ar, name_fr, name_en),
      categories (name_ar, name_fr, name_en),
      product_variants (price_dzd, package_weight_g)
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">كتالوج المنتجات</h1>
      
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product: any) => {
            const name = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
            const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;
            const price = product.product_variants?.[0]?.price_dzd || 0;
            return (
              <Link key={product.id} href={`/${locale}/product/${product.id}`} className="border rounded-lg p-4 hover:shadow-lg transition">
                <div className="h-48 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">صورة المنتج</div>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-gray-600">{farmName}</p>
                <p className="text-lg font-bold mt-2">{price} DZD</p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">لم يتم العثور على منتجات مطابقة.</p>
      )}
    </div>
  );
}