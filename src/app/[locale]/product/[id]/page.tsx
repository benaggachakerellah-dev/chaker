import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      farms (*),
      categories (*),
      product_variants (*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !product) {
    notFound();
  }

  // Fetch batch & QC inspection for this farm/product
  const { data: batches } = await supabase
    .from('batches')
    .select(`
      *,
      quality_inspections (*)
    `)
    .eq('farm_id', product.farm_id)
    .eq('qc_status', 'approved')
    .limit(1);

  // Fetch approved reviews for this product
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', product.id)
    .eq('moderation', 'approved')
    .order('created_at', { ascending: false });

  // Fetch related products (same category)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, name_ar, name_en, product_variants(price_dzd)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(3);

  const approvedBatch = batches?.[0];
  const inspection = approvedBatch?.quality_inspections?.[0];

  const productName = isAr ? product.name_ar : (product.name_en || product.name_ar);
  const productDesc = isAr ? product.description_ar : (product.description_en || product.description_ar);
  const farmName = isAr ? product.farms?.name_ar : (product.farms?.name_en || product.farms?.name_ar);

  const firstVariant = product.product_variants?.[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <div>
        <Link href={`/${locale}/catalog`} className="text-xs font-medium text-[#67402D] hover:underline">
          ← {isAr ? 'العودة إلى الكتالوج' : 'Back to Catalog'}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Images & QC Traceability */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7DED1] rounded-lg h-96 flex items-center justify-center relative shadow-subtle">
            <span className="text-9xl">🌴</span>
            {product.grade === 'premium' && (
              <span className="absolute top-4 right-4 bg-[#626C45] text-white text-xs px-3 py-1 rounded font-medium">
                Premium
              </span>
            )}
          </div>

          {/* Traceability Box */}
          <div className="bg-white p-6 rounded-lg shadow-subtle border border-[#E7DED1]">
            <h3 className="font-serif font-bold text-base mb-4 text-[#35251C] flex items-center gap-2">
              <span>🛡️</span> {t('product.traceability', locale)}
            </h3>
            {approvedBatch ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[#626C45] bg-[#626C45]/10 p-3 rounded-lg font-medium">
                  <span>✅</span> {t('product.qcPassed', locale)}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-gray-500 block text-xs">{t('product.harvestDate', locale)}</span>
                    <span className="font-medium text-gray-800">{approvedBatch.harvest_date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">{t('product.expiryDate', locale)}</span>
                    <span className="font-medium text-gray-800">{approvedBatch.expiry_date}</span>
                  </div>
                </div>
                {inspection?.notes && (
                  <div className="pt-2 border-t border-[#E7DED1]">
                    <span className="text-gray-500 block text-xs">{t('product.inspectorNotes', locale)}</span>
                    <p className="text-gray-700 mt-1 italic">"{inspection.notes}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm font-medium border border-amber-200">
                ⏳ {t('product.qcPending', locale)}
              </div>
            )}
          </div>
        </div>

        {/* Right: Info & Variants */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7DED1] rounded-lg p-8 shadow-subtle space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#67402D] uppercase tracking-wider">{farmName}</span>
              <h1 className="text-3xl font-serif font-bold text-[#35251C] mt-1">{productName}</h1>
              <p className="text-gray-600 mt-4 leading-relaxed text-sm">{productDesc}</p>
            </div>

            <div className="border-t border-[#E7DED1] pt-6 space-y-4">
              <h3 className="font-serif font-bold text-sm text-[#35251C]">{t('product.variants', locale)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.product_variants?.map((variant: any) => (
                  <div key={variant.id} className="border border-[#E7DED1] rounded-lg p-4 flex flex-col justify-between bg-[#F7F3EB]/50">
                    <div>
                      <span className="text-xs text-gray-500">SKU: {variant.sku}</span>
                      <div className="font-bold text-lg text-[#35251C] mt-1">{variant.price_dzd} DZD</div>
                      <span className="text-xs text-gray-600 block">{variant.weight_grams}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              {firstVariant ? (
                <AddToCartButton variantId={firstVariant.id} label={t('product.addToCart', locale)} />
              ) : (
                <p className="text-sm text-gray-500">No variants available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-lg p-8 shadow-subtle border border-[#E7DED1] space-y-6">
        <h3 className="font-serif font-bold text-xl text-[#35251C]">Customer Reviews</h3>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev: any) => (
              <div key={rev.id} className="border-b border-[#E7DED1] pb-4 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-bold text-[#35251C]">{rev.profiles?.full_name || 'Verified Customer'}</div>
                  <div className="text-amber-600 font-bold">{'⭐'.repeat(rev.rating)}</div>
                </div>
                <p className="text-gray-600 text-xs">{rev.comment}</p>
                <div className="text-[10px] text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No reviews yet.</p>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-xl text-[#35251C]">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel: any) => (
              <Link key={rel.id} href={`/${locale}/product/${rel.id}`} className="bg-white border border-[#E7DED1] rounded-lg p-4 shadow-subtle hover:border-[#35251C] transition">
                <div className="h-32 bg-[#F7F3EB] rounded mb-3 flex items-center justify-center text-3xl">🌴</div>
                <h4 className="font-serif font-bold text-sm text-[#35251C]">{isAr ? rel.name_ar : (rel.name_en || rel.name_ar)}</h4>
                <p className="text-xs font-bold text-[#67402D] mt-1">{rel.product_variants?.[0]?.price_dzd || 0} DZD</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
