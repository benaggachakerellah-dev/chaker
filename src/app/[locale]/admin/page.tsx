import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { updateFarmStatus } from '@/modules/admin/actions';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect(`/${locale}`);

  const { data: farms } = await supabase.from('farms').select('*').order('created_at', { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#35251C]">
          {t('admin.title', locale)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAr ? 'إدارة المزارع والموافقات والعمليات' : 'Manage farms, approvals, and platform operations'}
        </p>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg p-6 shadow-subtle space-y-6">
        <h2 className="font-serif font-bold text-lg text-[#35251C] border-b border-[#E7DED1] pb-3">
          {t('admin.farmApproval', locale)}
        </h2>
        <div className="divide-y divide-[#E7DED1]">
          {farms && farms.length > 0 ? (
            farms.map((farm: any) => (
              <div key={farm.id} className="py-4 flex justify-between items-center text-sm">
                <div>
                  <div className="font-bold text-[#35251C]">{farm.name}</div>
                  <div className="text-xs text-gray-500">{t('admin.region', locale)}: {farm.region} | {t('admin.status', locale)}: <span className="font-medium text-[#67402D]">{farm.status}</span></div>
                </div>
                <div className="flex gap-2">
                  <form action={async () => {
                    'use server';
                    await updateFarmStatus(farm.id, 'approved');
                  }} className="inline">
                    <button type="submit" className="text-xs bg-[#626C45] text-white px-3 py-1.5 rounded font-medium">
                      {t('admin.approve', locale)}
                    </button>
                  </form>
                  <form action={async () => {
                    'use server';
                    await updateFarmStatus(farm.id, 'suspended');
                  }} className="inline">
                    <button type="submit" className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded font-medium">
                      {t('admin.suspend', locale)}
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 py-4">{t('admin.noFarms', locale)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
