import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    unreadCount = count || 0;
  }

  return (
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href={`/${locale}`} className="text-xl font-bold font-serif text-desert-dark flex items-center gap-2">
          <span>🌴</span> Desert Gold
        </Link>
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/catalog`} className="text-sm font-medium text-gray-700 hover:text-desert-gold transition">
            Catalog
          </Link>
          <Link href={`/${locale}/cart`} className="text-sm font-medium text-gray-700 hover:text-desert-gold transition">
            Cart
          </Link>
          <Link href={`/${locale}/account/orders`} className="text-sm font-medium text-gray-700 hover:text-desert-gold transition">
            My Orders
          </Link>
          {user && (
            <Link href={`/${locale}/account/notifications`} className="relative text-xl text-gray-700 hover:text-desert-gold transition">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-600 border-t">
        Desert Gold 2026 — Verified Provenance & Premium Oasis Dates
      </footer>
    </div>
  );
}
