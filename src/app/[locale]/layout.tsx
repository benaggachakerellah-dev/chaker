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
  const isAr = locale === 'ar';

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
    <div dir={dir} lang={locale} className="min-h-screen flex flex-col bg-[#F7F3EB] text-[#27231F]">
      <header className="bg-white border-b border-[#E7DED1] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link href={`/${locale}`} className="text-xl font-bold font-serif text-[#35251C] flex items-center gap-2">
            <span className="text-2xl">🌴</span>
            <span>{isAr ? 'الذهب الصحراوي' : 'Desert Gold'}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}`} className="text-sm font-medium text-[#35251C] hover:text-[#67402D] transition">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <Link href={`/${locale}/catalog`} className="text-sm font-medium text-[#35251C] hover:text-[#67402D] transition">
              {isAr ? 'الكتالوج' : 'Catalog'}
            </Link>
            <Link href={`/${locale}/farms`} className="text-sm font-medium text-[#35251C] hover:text-[#67402D] transition">
              {isAr ? 'المزارع' : 'Farms'}
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link href={`/${locale}/cart`} className="text-sm font-medium text-[#35251C] hover:text-[#67402D] transition flex items-center gap-1.5">
              <span>🛒</span>
              <span className="hidden sm:inline">{isAr ? 'السلة' : 'Cart'}</span>
            </Link>
            <Link href={`/${locale}/account/orders`} className="text-sm font-medium text-[#35251C] hover:text-[#67402D] transition flex items-center gap-1.5">
              <span>📦</span>
              <span className="hidden sm:inline">{isAr ? 'طلباتي' : 'Orders'}</span>
            </Link>
            {user && (
              <Link href={`/${locale}/account/notifications`} className="relative text-lg p-1">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#626C45] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#35251C] text-[#F7F3EB] pt-16 pb-12 border-t border-[#E7DED1]/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span>🌴</span> {isAr ? 'الذهب الصحراوي' : 'Desert Gold'}
            </h3>
            <p className="text-sm text-[#E7DED1]/80 leading-relaxed">
              {isAr
                ? 'منصة التجارة الإلكترونية للتمور الفاخرة من أودية ومزارع الجزائر المختارة بعناية.'
                : 'Premium date e-commerce marketplace featuring selected Algerian oasis farms and verified provenance.'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-white mb-4 text-sm tracking-wide uppercase">
              {isAr ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E7DED1]/80">
              <li><Link href={`/${locale}/catalog`} className="hover:text-white transition">{isAr ? 'كتالوج المنتجات' : 'Product Catalog'}</Link></li>
              <li><Link href={`/${locale}/farms`} className="hover:text-white transition">{isAr ? 'المزارع الشريكة' : 'Our Partner Farms'}</Link></li>
              <li><Link href={`/${locale}/cart`} className="hover:text-white transition">{isAr ? 'سلة المشتريات' : 'Shopping Cart'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-4 text-sm tracking-wide uppercase">
              {isAr ? 'حسابي' : 'Account'}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#E7DED1]/80">
              <li><Link href={`/${locale}/account/orders`} className="hover:text-white transition">{isAr ? 'طلباتي' : 'My Orders'}</Link></li>
              <li><Link href={`/${locale}/account/notifications`} className="hover:text-white transition">{isAr ? 'الإشعارات' : 'Notifications'}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-white mb-4 text-sm tracking-wide uppercase">
              {isAr ? 'الجودة والثقة' : 'Trust & Quality'}
            </h4>
            <p className="text-xs text-[#E7DED1]/70 leading-relaxed">
              {isAr
                ? 'جميع التمور تخضع لفحص دقيق للرطوبة والنقاء وفق أعلى معايير الجودة الزراعية.'
                : 'All dates undergo rigorous 5-point quality inspection for moisture, size, and purity.'}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-[#E7DED1]/10 text-center text-xs text-[#E7DED1]/60">
          © 2026 Desert Gold. All rights reserved. Verified Provenance & Premium Oasis Dates.
        </div>
      </footer>
    </div>
  );
}
