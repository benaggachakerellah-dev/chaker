import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { Locale, locales } from '@/lib/i18n/config';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  const isAr = locale === 'ar';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-[#FDFBF7]">
      <h1 className={`text-6xl font-bold mb-6 tracking-tight ${isAr ? 'font-tajawal' : 'font-serif'} text-[#3E2723]`}>
        {isAr ? 'فخامة التمور الجزائرية' : 'Premium Algerian Dates'}
      </h1>
      <p className={`text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${isAr ? 'font-tajawal' : 'font-sans'} text-gray-700`}>
        {isAr ? 'تمور فاخرة، جودة موثقة، ومصدر شفاف. توصيل إلى باب منزلك.' : 'Premium dates, verified quality, transparent provenance, delivered to your door.'}
      </p>
      <div className="flex gap-4">
        <Link href={`/${locale}/catalog`} className="bg-[#3E2723] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#3E2723]/90 transition shadow-lg text-lg">
          {isAr ? 'استكشف الكتالوج' : 'Explore Catalog'}
        </Link>
        <Link href={`/${locale}/farms`} className="bg-white text-[#3E2723] border-2 border-[#3E2723] px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition text-lg">
          {isAr ? 'مزارعنا' : 'Our Farms'}
        </Link>
      </div>
    </div>
  );
}