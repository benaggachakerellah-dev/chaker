import { createClient } from '@/lib/supabase/server';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { Locale, locales } from '@/lib/i18n/config';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const supabase = createClient();

  // Fetch top 3 featured products
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      id,
      name_ar,
      name_fr,
      name_en,
      grade,
      farms (name_ar, name_fr, name_en),
      product_variants (price_dzd)
    `)
    .eq('is_active', true)
    .limit(3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">
            <span className="block text-secondary mb-2 text-3xl md:text-4xl">فخامة التمور الجزائرية</span>
            Premium Algerian Dates
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Verified quality, transparent provenance, delivered to your door.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/catalog`} className="bg-secondary text-primary font-bold px-8 py-4 rounded-2xl shadow-premium hover:bg-secondary/90 transition">
              Explore Catalog
            </Link>
            <Link href={`/${locale}/farms`} className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-medium hover:bg-white/20 transition">
              Our Farms
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-primary">Featured Collection</h2>
          <p className="text-gray-600 mt-2">Handpicked premium oasis dates with guaranteed batch traceability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts?.map((product: any) => {
            const name = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
            const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;
            const price = product.product_variants?.[0]?.price_dzd || 0;

            return (
              <div key={product.id} className="bg-white rounded-2xl shadow-premium p-6 flex flex-col justify-between border border-gray-100 hover:scale-105 transition duration-300">
                <div>
                  <div className="h-56 bg-amber-50 rounded-xl mb-6 flex items-center justify-center text-6xl shadow-inner">
                    🌴
                  </div>
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">{farmName}</span>
                  <h3 className="text-xl font-serif font-bold text-primary mt-1">{name}</h3>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xl font-bold text-secondary">{price} DZD</span>
                  <Link href={`/${locale}/product/${product.id}`} className="text-xs bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary/95 transition">
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Desert Gold Section */}
      <section className="bg-[#F5F0E8] py-20 px-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <h2 className="text-3xl font-serif font-bold text-primary">Why Desert Gold?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="text-4xl">🏅</div>
              <h3 className="text-xl font-bold text-primary font-serif">Verified Quality</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Rigorous 5-point quality inspection on moisture, size, and purity before any harvest is approved.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="text-4xl">🌍</div>
              <h3 className="text-xl font-bold text-primary font-serif">Traceable Origin</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Full batch provenance linking directly back to certified oasis farms in Biskra, El Oued, and Ghardaïa.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div className="text-4xl">📦</div>
              <h3 className="text-xl font-bold text-primary font-serif">Premium Packaging</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Hermetically sealed export-grade packaging designed to lock in natural freshness and exquisite flavor.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
