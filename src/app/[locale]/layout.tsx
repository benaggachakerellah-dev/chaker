import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href={`/${locale}`} className="text-xl font-bold font-serif text-[#3E2723] flex items-center gap-2 no-underline">
          <span>🌴</span> Desert Gold
        </Link>
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/catalog`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline">
            {locale === 'ar' ? 'الكتالوج' : 'Catalog'}
          </Link>
          <Link href={`/${locale}/cart`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline">
            {locale === 'ar' ? 'السلة' : 'Cart'}
          </Link>
          <Link href={`/${locale}/auth`} className="bg-[#3E2723] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3E2723]/90 transition no-underline">
            {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-[#3E2723] text-white py-6 text-center text-sm">
        Desert Gold 2026 — Verified Provenance & Premium Oasis Dates
      </footer>
    </div>
  );
}