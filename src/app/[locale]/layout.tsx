import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const { locale } = params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null);
    unreadCount = count || 0;
  }

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
          <Link href={`/${locale}/account/orders`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline">
            {locale === 'ar' ? 'طلباتي' : 'My Orders'}
          </Link>
          {user && (
            <Link href={`/${locale}/account/notifications`} className="relative text-xl no-underline">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-[#3E2723] text-white py-6 text-center text-sm">
        Desert Gold 2026 — Verified Provenance & Premium Oasis Dates
      </footer>
    </div>
  );
}