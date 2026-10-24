import { createClient } from '@supabase/supabase-js';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#3E2723] to-[#2D1B18] text-white py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight">
            <span className="block text-[#D4AF37] mb-3 text-3xl md:text-4xl">فخامة التمور الجزائرية</span>
            Premium Algerian Dates
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Verified quality, transparent provenance, delivered to your door.
          </p>
          <div className="pt-6 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/catalog`}
              className="bg-[#D4AF37] text-[#3E2723] font-bold px-9 py-4 rounded-xl shadow-premium hover:bg-[#c5a030] transition-all duration-300"
            >
              {locale === 'ar' ? 'اكتشف الكتالوج' : 'Explore Catalog'}
            </Link>
            <Link
              href={`/${locale}/farms`}
              className="bg-white/10 text-white border border-white/20 px-9 py-4 rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
            >
              {locale === 'ar' ? 'مزارعنا' : 'Our Farms'}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl font-serif font-bold text-[#3E2723]">Featured Collection</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Handpicked premium oasis dates with guaranteed batch traceability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts?.map((product: any) => {
            const name = locale === 'fr' ? product.name_fr : locale === 'en' ? product.name_en : product.name_ar;
            const farmName = locale === 'fr' ? product.farms?.name_fr : locale === 'en' ? product.farms?.name_en : product.farms?.name_ar;
            const price = product.product_variants?.[0]?.price_dzd || 0;
            const isPremium = product.grade === 'premium';

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-premium p-6 flex flex-col justify-between border border-gray-100 hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                {isPremium && (
                  <span className="absolute top-4 right-4 bg-[#D4AF37] text-[#3E2723] text-xs px-3 py-1 rounded-full font-bold shadow-sm z-10">
                    Premium
                  </span>
                )}
                <div>
                  <div className="h-56 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl mb-6 flex items-center justify-center text-7xl shadow-inner group-hover:scale-105 transition-transform duration-300">
                    🌴
                  </div>
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">{farmName || 'Oasis Farm'}</span>
                  <h3 className="text-2xl font-serif font-bold text-[#3E2723] mt-1">{name}</h3>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-2xl font-bold text-[#D4AF37]">{price} DZD</span>
                  <Link
                    href={`/${locale}/product/${product.id}`}
                    className="text-xs bg-[#3E2723] text-white px-5 py-3 rounded-xl font-medium hover:bg-[#8B5A2B] transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Desert Gold Section */}
      <section className="bg-[#F5F0E6] py-24 px-6 border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto text-center space-y-16">
          <h2 className="text-4xl font-serif font-bold text-[#3E2723]">Why Desert Gold?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-2xl shadow-premium border border-gray-100 space-y-4">
              <div className="text-4xl">🏅</div>
              <h3 className="text-xl font-bold text-[#3E2723] font-serif">Verified Quality</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Rigorous 5-point quality inspection on moisture, size, and purity before any harvest is approved.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-premium border border-gray-100 space-y-4">
              <div className="text-4xl">🌍</div>
              <h3 className="text-xl font-bold text-[#3E2723] font-serif">Traceable Origin</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Full batch provenance linking directly back to certified oasis farms in Biskra, El Oued, and Ghardaïa.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-premium border border-gray-100 space-y-4">
              <div className="text-4xl">📦</div>
              <h3 className="text-xl font-bold text-[#3E2723] font-serif">Premium Packaging</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Hermetically sealed export-grade packaging designed to lock in natural freshness and exquisite flavor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#3E2723] text-white py-12 px-6 text-center text-sm space-y-3 border-t border-[#2D1B18]">
        <div className="font-serif text-lg font-bold text-[#D4AF37]">Desert Gold</div>
        <p className="text-gray-400">Verified Provenance & Premium Oasis Dates</p>
        <p className="text-xs text-gray-500 pt-4">© 2026 Desert Gold. All rights reserved.</p>
      </footer>
    </div>
  );
}
