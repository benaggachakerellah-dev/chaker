import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function QCDashboardPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}`);

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['qc', 'admin'].includes(profile.role)) {
    redirect(`/${locale}`);
  }

  // Fetch pending batches
  const { data: pendingBatches } = await supabase
    .from('batches')
    .select(`
      *,
      farms (name_ar, name_fr, name_en)
    `)
    .eq('qc_status', 'pending');

  // Fetch recent inspections
  const { data: inspections } = await supabase
    .from('quality_inspections')
    .select(`
      *,
      batches (batch_number)
    `)
    .order('inspected_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-desert-dark">{t('qc.title', locale)}</h1>
        <p className="text-gray-600 mt-2">Manage quality inspections and verify batches before fulfillment.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-serif font-bold text-xl mb-6 text-gray-900">{t('qc.pendingBatches', locale)}</h2>
        {!pendingBatches || pendingBatches.length === 0 ? (
          <p className="text-gray-500 py-4">No pending batches awaiting inspection.</p>
        ) : (
          <div className="space-y-4">
            {pendingBatches.map(batch => {
              const farmName = locale === 'fr' ? batch.farms?.name_fr : locale === 'en' ? batch.farms?.name_en : batch.farms?.name_ar;
              return (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-xl hover:border-desert-gold transition">
                  <div>
                    <div className="font-bold text-gray-900">Batch #{batch.batch_number}</div>
                    <div className="text-xs text-gray-500 mt-1">Farm: {farmName} | Qty: {batch.quantity} {batch.unit} | Harvest: {batch.harvest_date}</div>
                  </div>
                  <Link
                    href={`/${locale}/qc/inspect/${batch.id}`}
                    className="bg-desert-gold text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-desert-gold/90 transition"
                  >
                    {t('qc.startInspection', locale)}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
