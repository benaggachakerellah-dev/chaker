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

  const [
    { data: featuredProducts },
    { data: categories },
    { data: farms }
  ] = await Promise.all([
    supabase.from('products').select('id, name_ar, name_fr, name_en, grade, farms(name_ar, name_fr, name_en), product_variants(price_dzd)').eq('is_active', true).limit(3),
    supabase.from('categories').select('*').limit(3),
    supabase.from('farms').select('*').eq('status', 'approved').limit(3)
  ]);

  const isAr = locale === 'ar';

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F3EB] text-[#27231F]">
      {/* Hero Section */}
      <section className="relative bg-[#F7F3EB] py-20 md:py-32 px-6 border-b border-[#E7DED1]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 rounded bg-[#626C45]/10 text-[#626C45] text-xs font-medium uppercase tracking-wider">
              {isAr ? 'تمور ميسرة ومعتمدة' : 'Verified & Certified'}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#35251C] leading-tight">
              {isAr ? 'خير النخلة، يصل إلى مائدتك.' : 'The Bounty of the Palm, Delivered to Your Table.'}
            </h1>
            <p className="text-lg text-[#27231F]/80 max-w-lg leading-relaxed">
              {isAr
                ? 'اكتشف تمورًا مختارة من منتجين موثوقين، وتعرّف على أصنافها ومصدرها قبل أن تختار.'
                : 'Discover handpicked dates from trusted producers, and explore their provenance before you choose.'}
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={`/${locale}/catalog`}
                className="bg-[#35251C] text-white px-7 py-3.5 rounded-lg text-sm font-medium hover:bg-[#35251C]/90 transition"
              >
                {isAr ? 'اكتشف التمور' : 'Explore Catalog'}
              </Link>
              <Link
                href={`/${locale}/farms`}
                className="text-[#35251C] border border-[#E7DED1] px-7 py-3.5 rounded-lg text-sm font-medium hover:bg-white transition"
              >
                {isAr ? 'تعرّف على المنتجين' : 'Our Producers'}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-[#D9BD91]/30 to-[#67402D]/10 rounded-xl h-[400px] flex items-center justify-center border border-[#E7DED1] shadow-subtle">
              <span className="text-8xl">🌴</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Variety / Categories */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#35251C]">
              {isAr ? 'تسوق حسب الصنف' : 'Shop by Variety'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isAr ? 'أجود أنواع التمور الجزائرية الأصيلة' : 'Finest authentic Algerian date varieties'}
            </p>
          </div>
          <Link href={`/${locale}/catalog`} className="text-xs font-medium text-[#67402D] hover:underline">
            {isAr ? 'عرض الكل ←' : 'View All →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((cat: any) => {
              const catName = isAr ? cat.name_ar : (cat.name_en || cat.name_ar);
              return (
                <Link key={cat.id} href={`/${locale}/catalog?category=${cat.id}`} className="group bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle hover:border-[#35251C] transition">
                  <div className="h-36 bg-[#F7F3EB] rounded-md mb-4 flex items-center justify-center text-4xl">
                    🌾
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#35251C] group-hover:text-[#67402D] transition">{catName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{isAr ? 'اكتشف الأصناف المتاحة' : 'Explore available varieties'}</p>
                </Link>
              );
            })
          ) : (
            <div className="col-span-3 text-sm text-gray-500 bg-white border border-[#E7DED1] rounded-lg p-6">
              {isAr ? 'لا توجد تصنيفات حالياً' : 'No categories available'}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white border-t border-b border-[#E7DED1] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#35251C]">
                {isAr ? 'المنتجات المميزة' : 'Featured Products'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isAr ? 'تمور مختارة ومختبرة مخبرياً لضمان الجودة' : 'Handpicked and laboratory-tested for purity'}
              </p>
            </div>
            <Link href={`/${locale}/catalog`} className="text-xs font-medium text-[#67402D] hover:underline">
              {isAr ? 'كتالوج المنتجات ←' : 'Browse Catalog →'}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts?.map((product: any) => {
              const name = isAr ? product.name_ar : (product.name_en || product.name_ar);
              const farmName = isAr ? product.farms?.name_ar : (product.farms?.name_en || product.farms?.name_ar);
              const price = product.product_variants?.[0]?.price_dzd || 0;

              return (
                <Link key={product.id} href={`/${locale}/product/${product.id}`} className="group bg-[#F7F3EB] border border-[#E7DED1] rounded-lg p-5 shadow-subtle flex flex-col justify-between hover:border-[#35251C] transition">
                  <div>
                    <div className="h-48 bg-white rounded-md mb-4 flex items-center justify-center text-5xl">
                      🌴
                    </div>
                    <span className="text-xs font-medium text-[#67402D] uppercase tracking-wide">{farmName || 'Oasis Farm'}</span>
                    <h3 className="font-serif font-bold text-lg text-[#35251C] mt-1 group-hover:text-[#67402D] transition">{name}</h3>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E7DED1] flex items-center justify-between">
                    <span className="font-bold text-[#35251C]">{price} DZD</span>
                    <span className="text-xs bg-[#35251C] text-white px-3 py-1.5 rounded font-medium">
                      {isAr ? 'التفاصيل' : 'View'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Discover Producers (Farms) */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#35251C]">
              {isAr ? 'المنتجون الشركاء' : 'Our Producers'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isAr ? 'مزارع الواحات العريقة في Biskra و El Oued' : 'Heritage oasis farms in Biskra and El Oued'}
            </p>
          </div>
          <Link href={`/${locale}/farms`} className="text-xs font-medium text-[#67402D] hover:underline">
            {isAr ? 'جميع المزارع ←' : 'All Farms →'}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {farms && farms.length > 0 ? (
            farms.map((farm: any) => (
              <div key={farm.id} className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle space-y-3">
                <div className="text-2xl">🌱</div>
                <h3 className="font-serif font-bold text-lg text-[#35251C]">{farm.name}</h3>
                <p className="text-xs text-gray-500">{isAr ? 'المنطقة:' : 'Region:'} {farm.region}</p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{farm.description || 'Verified oasis farm producer.'}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-sm text-gray-500 bg-white border border-[#E7DED1] rounded-lg p-6">
              {isAr ? 'لا توجد مزارع معتمدة حالياً' : 'No approved farms available'}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Service */}
      <section className="bg-white border-t border-b border-[#E7DED1] py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-2">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-serif font-bold text-[#35251C]">{isAr ? 'دفع آمن عند الاستلام' : 'Secure Cash on Delivery'}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr ? 'ادفع نقداً بكل أمان وسهولة عند استلام طلبك حتى باب منزلك.' : 'Pay securely with cash upon delivery right to your doorstep.'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl mb-2">🚚</div>
            <h3 className="font-serif font-bold text-[#35251C]">{isAr ? 'توصيل موثوق وسريع' : 'Reliable & Fast Delivery'}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr ? 'شحن منظم ومبرّد لضمان وصول التمور بحالتها الطازجة.' : 'Organized shipping ensuring dates arrive in pristine fresh condition.'}
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl mb-2">🛡️</div>
            <h3 className="font-serif font-bold text-[#35251C]">{isAr ? 'جودة مفحوصة ومضمونة' : 'Verified Quality Inspection'}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isAr ? 'كل دفعة تخضع لتقارير مختبرية دقيقة للرطوبة والصلاحية.' : 'Each batch undergoes rigorous laboratory checks for moisture and expiry.'}
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-[#35251C] text-[#F7F3EB] rounded-lg p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#D9BD91]">
              {isAr ? 'تراث واحات الصحراء' : 'Desert Oasis Heritage'}
            </span>
            <h2 className="text-3xl font-serif font-bold leading-snug">
              {isAr ? 'دليل حفظ واختيار التمور الفاخرة' : 'Guide to Storing & Selecting Fine Dates'}
            </h2>
            <p className="text-sm text-[#E7DED1]/80 leading-relaxed">
              {isAr
                ? 'تحتاج التمور الفاخرة مثل الدقلة نور إلى درجات حرارة منخفضة للحفاظ على رطوبتها الطبيعية ومذاقها الفريد. تعرف على أسرار التخزين السليم.'
                : 'Premium dates like Deglet Nour require controlled temperatures to preserve their natural moisture and exquisite flavor. Learn proper storage secrets.'}
            </p>
          </div>
          <div className="bg-[#67402D]/40 border border-[#E7DED1]/20 rounded-lg h-64 flex items-center justify-center text-6xl">
            📖
          </div>
        </div>
      </section>
    </div>
  );
}
