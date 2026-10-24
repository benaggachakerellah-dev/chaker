import { locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';

export default function LocaleNotFound({ params }: { params: { locale: string } }) {
  const locale = locales.includes(params.locale as any) ? params.locale : 'ar';
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-serif font-bold mb-4">404 — Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
      <Link href={`/${locale}`} className="bg-desert-gold text-white px-6 py-3 rounded-lg font-medium">
        Go to Home
      </Link>
    </div>
  );
}
