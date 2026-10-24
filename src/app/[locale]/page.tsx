import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { Locale, locales } from '@/lib/i18n/config';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-6xl font-serif font-bold text-desert-dark mb-6 tracking-tight">
        {t('brand.name', locale) || 'Desert Gold'}
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
        {t('home.hero.subtitle', locale) || 'Premium dates, verified quality, transparent provenance.'}
      </p>
      <div className="flex gap-4">
        <Link href={`/${locale}/catalog`} className="bg-desert-dark text-white px-8 py-4 rounded-xl font-medium hover:bg-desert-dark/90 transition shadow-lg">
          {t('nav.catalog', locale) || 'Explore Catalog'}
        </Link>
        <Link href={`/${locale}/farms`} className="bg-white text-desert-dark border-2 border-desert-dark px-8 py-4 rounded-xl font-medium hover:bg-gray-50 transition">
          {t('nav.farms', locale) || 'Our Farms'}
        </Link>
      </div>
    </div>
  );
}