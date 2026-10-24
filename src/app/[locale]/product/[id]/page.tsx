import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import { notFound } from 'next/navigation';
import { t } from '@/lib/i18n/t';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
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

  const approvedBatch = batches?.[0];
  const inspection = approvedBatch?.quality_inspections?.[0];

  const productName = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
  const productDesc = locale === 'fr' ? product.description_fr : locale === 'en' ? product.description_en : product.description_ar;
  const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;

  const firstVariant = product.product_variants?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <Link href={`/${locale}/catalog`} className="text-sm font-medium text-[#D4AF37] hover:underline">
          ← {locale === 'ar' ? 'العودة إلى الكتالوج' : 'Back to Catalog'}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image & Traceability Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl h-96 flex items-center justify-center relative shadow-premium border border-amber-200/50">
            <span className="text-9xl">🌴</span>
            {product.grade === 'premium' && (
              <span className="absolute top-4 right-4 bg-[#D4AF37] text-[#3E2723] text-xs px-4 py-1.5 rounded-full font-bold shadow-sm">
                Premium
              </span>
            )}
          </div>

          {/* Traceability Box */}
          <div className="bg-white p-6 rounded-2xl shadow-premium border border-gray-100">
            <h3 className="font-serif font-bold text-lg mb-4 text-[#3E2723] flex items-center gap-2">
              <span>🛡️</span> {t('product.traceability', locale)}
            </h3>
            {approvedBatch ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-xl font-medium border border-green-100">
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
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-500 block text-xs">{t('product.inspectorNotes', locale)}</span>
                    <p className="text-gray-700 mt-1 italic">"{inspection.notes}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-medium border border-amber-100">
                ⏳ {t('product.qcPending', locale)}
              </div>
            )}
          </div>
        </div>

        {/* Product Info & Variants */}
        <div className="space-y-6">
          <div>
            <span className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">{farmName}</span>
            <h1 className="text-4xl font-serif font-bold text-[#3E2723] mt-2">{productName}</h1>
            <p className="text-gray-600 mt-4 leading-relaxed text-base">{productDesc}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 space-y-4">
            <h3 className="font-serif font-bold text-lg text-[#3E2723]">{t('product.variants', locale)}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.product_variants?.map((variant: any) => (
                <div key={variant.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col justify-between hover:border-[#D4AF37] transition bg-white shadow-sm">
                  <div>
                    <span className="text-xs text-gray-400 font-medium">SKU: {variant.sku}</span>
                    <div className="font-bold text-2xl text-[#D4AF37] mt-1">{variant.price_dzd} DZD</div>
                    <span className="text-xs text-gray-600 mt-1 block font-medium">{variant.weight_grams}g package</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>Stock: {variant.stock_qty}</span>
                    <span className="text-green-600 font-bold">In Stock</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {firstVariant ? (
              <div className="w-full">
                <AddToCartButton variantId={firstVariant.id} label={t('product.addToCart', locale)} />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No variants available</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-2xl p-8 shadow-premium border border-gray-100 space-y-6">
        <h3 className="font-serif font-bold text-2xl text-[#3E2723]">Customer Reviews</h3>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((rev: any) => (
              <div key={rev.id} className="border-b border-gray-100 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 text-sm">{rev.profiles?.full_name || 'Verified Customer'}</div>
                  <div className="text-amber-500 font-bold text-sm">{'⭐'.repeat(rev.rating)}</div>
                </div>
                <p className="text-gray-600 text-sm">{rev.comment}</p>
                <div className="text-xs text-gray-400">{new Date(rev.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
