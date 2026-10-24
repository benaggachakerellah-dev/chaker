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
      {/* Navbar */}
      <header className="bg-white border-b border-[#E7DED1] py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href={`/${locale}`} className="text-xl font-bold font-serif text-[#3E2723] flex items-center gap-2 no-underline">
          <span>🌴</span> Desert Gold
        </Link>
        
        <div className="flex items-center gap-6">
          <Link href={`/${locale}/catalog`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline">
            {locale === 'ar' ? 'الكتالوج' : 'Catalog'}
          </Link>
          <Link href={`/${locale}/farms`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline">
            {locale === 'ar' ? 'المزارع' : 'Farms'}
          </Link>
          <Link href={`/${locale}/cart`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline flex items-center gap-1">
            {locale === 'ar' ? 'السلة' : 'Cart'} 🛒
          </Link>
          
          {user ? (
            <>
              <Link href={`/${locale}/account/orders`} className="text-sm font-medium text-gray-700 hover:text-[#3E2723] transition no-underline">
                {locale === 'ar' ? 'طلباتي' : 'Orders'}
              </Link>
              <Link href={`/${locale}/account/notifications`} className="relative text-xl no-underline">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <form action="/auth/signout" method="post" className="m-0">
                <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800 transition">
                  {locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </form>
            </>
          ) : (
            <Link href={`/${locale}/auth`} className="bg-[#3E2723] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3E2723]/90 transition no-underline">
              {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#3E2723] text-white py-8 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-right">
            <div>
              <h4 className="font-bold mb-2">روابط سريعة</h4>
              <ul className="space-y-1">
                <li><Link href={`/${locale}/catalog`} className="hover:underline no-underline">المنتجات</Link></li>
                <li><Link href={`/${locale}/farms`} className="hover:underline no-underline">المزارع</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">حسابي</h4>
              <ul className="space-y-1">
                <li><Link href={`/${locale}/account/orders`} className="hover:underline no-underline">طلباتي</Link></li>
                <li><Link href={`/${locale}/account/notifications`} className="hover:underline no-underline">الإشعارات</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">الجودة والثقة</h4>
              <p className="text-gray-300 text-xs">تمور مختارة بعناية، وفحص جودة صارم قبل الشحن.</p>
            </div>
          </div>
          <div className="border-t border-gray-600 pt-4 text-xs text-gray-400">
            © Desert Gold 2026. Verified Provenance & Premium Oasis Dates.
          </div>
        </div>
      </footer>
    </div>
  );
}