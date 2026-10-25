import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { Locale, locales } from '@/lib/i18n/config';
export const dynamic = 'force-static';
export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const isAr = locale === 'ar';

  return (
    <div className="bg-[#F7F3EB] min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-start z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-[#D9BD91]/30 text-[#67402D] text-sm font-semibold mb-6">
            {isAr ? 'خير النخلة، بين يديك' : 'The Best of the Palm, In Your Hands'}
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold text-[#35251C] leading-tight mb-6 font-serif">
            {isAr ? (
              <>فخامة التمور <br /><span className="text-[#67402D]">الجزائرية</span></>
            ) : (
              <>Premium <br /><span className="text-[#67402D]">Algerian Dates</span></>
            )}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
            {isAr 
              ? 'اكتشف تموراً مختارة بعناية من أفضل المزارع الجزائرية. جودة موثقة، مصدر شفاف، وتوصيل إلى باب منزلك.'
              : 'Discover carefully selected dates from the best Algerian farms. Verified quality, transparent origin, delivered to your door.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href={`/${locale}/catalog`} className="bg-[#35251C] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#67402D] transition-colors duration-300 text-center">
              {isAr ? 'تسوق الآن' : 'Shop Now'}
            </Link>
            <Link href={`/${locale}/farms`} className="bg-transparent border-2 border-[#35251C] text-[#35251C] px-8 py-4 rounded-lg font-bold hover:bg-[#35251C] hover:text-white transition-colors duration-300 text-center">
              {isAr ? 'تعرف على المزارع' : 'Discover Farms'}
            </Link>
          </div>
        </div>

        <div className="flex-1 relative w-full h-[400px] lg:h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#D9BD91] to-[#F7F3EB] rounded-[2rem] transform rotate-3 scale-105 shadow-2xl opacity-50"></div>
          <div className="absolute inset-0 bg-[#67402D] rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center">
             <span className="text-white/20 text-9xl font-serif">DG</span>
          </div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <section className="bg-white py-8 border-y border-[#E7DED1]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#E7DED1]">
          <div className="p-4">
            <h3 className="font-bold text-[#35251C] text-lg mb-1">{isAr ? 'فحص جودة صارم' : 'Strict Quality Control'}</h3>
            <p className="text-sm text-gray-500">{isAr ? 'كل دفعة تمر بـ 5 اختبارات' : 'Every batch passes 5 tests'}</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-[#35251C] text-lg mb-1">{isAr ? 'تتبع كامل للدفعة' : 'Full Batch Traceability'}</h3>
            <p className="text-sm text-gray-500">{isAr ? 'اعرف مصدر تمرك بالضبط' : 'Know exactly where your dates come from'}</p>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-[#35251C] text-lg mb-1">{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</h3>
            <p className="text-sm text-gray-500">{isAr ? 'ادفع فقط عندما تستلم طلبك' : 'Pay only when you receive your order'}</p>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-[#35251C] font-serif mb-2">{isAr ? 'تسوق حسب الصنف' : 'Shop by Variety'}</h2>
            <p className="text-gray-600">{isAr ? 'أجود أنواع التمور الجزائرية' : 'The finest Algerian dates'}</p>
          </div>
          <Link href={`/${locale}/catalog`} className="text-[#67402D] font-bold hover:underline">
            {isAr ? 'عرض الكل ←' : 'View All →'}
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['عجوة / Ajwa', 'سكري / Sukari', 'مجهول / Medjool', 'دقلة نور / Deglet Nour'].map((variety, idx) => (
            <Link key={idx} href={`/${locale}/catalog`} className="group relative h-48 rounded-xl overflow-hidden bg-gray-200">
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <span className="text-white font-bold text-xl">{variety.split(' / ')[isAr ? 0 : 1]}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL SECTION */}
      <section className="py-20 bg-[#35251C] text-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="aspect-square bg-[#67402D] rounded-2xl w-full max-w-md mx-auto"></div>
          </div>
          <div className="flex-1 text-center md:text-start">
            <span className="text-[#D9BD91] font-semibold tracking-wider uppercase text-sm mb-4 block">
              {isAr ? 'قصتنا' : 'Our Story'}
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-6 leading-tight">
              {isAr ? 'من واحات الجزائر، إلى مائدتك' : 'From the Oases of Algeria, to Your Table'}
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {isAr 
                ? 'نعمل مباشرة مع كبار مزارعي التمور في بسكرة، الوادي، وغرداية. كل تمرة نقدمها تحمل قصة، قصة أرض طيبة، وزراعة أصيلة، وفحص دقيق يضمن أعلى معايير الجودة العالمية.'
                : 'We work directly with major date farmers in Biskra, El Oued, and Ghardaia. Every date we offer carries a story—a story of fertile land, authentic farming, and rigorous inspection that meets the highest global quality standards.'}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}