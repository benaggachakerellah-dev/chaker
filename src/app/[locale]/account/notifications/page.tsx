import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function NotificationsPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}`);

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <Link href={`/${locale}/account/orders`} className="text-sm text-desert-gold hover:underline">
          ← {locale === 'ar' ? 'العودة إلى الطلبات' : 'Back to Orders'}
        </Link>
        <h1 className="text-3xl font-serif font-bold text-desert-dark mt-2">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">Updates regarding your orders and platform activity.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y">
        {notifications && notifications.length > 0 ? (
          notifications.map((n: any) => (
            <div key={n.id} className="p-6 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-base">{n.title}</h3>
                <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 text-sm">{n.message}</p>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
            No notifications found.
          </div>
        )}
      </div>
    </div>
  );
}
