import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { notFound, redirect } from 'next/navigation';
import InspectForm from '@/components/InspectForm';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function InspectBatchPage({ params }: { params: { locale: string; batchId: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}`);

  const { data: batch, error } = await supabase
    .from('batches')
    .select(`
      *,
      farms (name_ar, name_fr, name_en)
    `)
    .eq('id', params.batchId)
    .single();

  if (error || !batch) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <InspectForm batch={batch} locale={locale} />
    </div>
  );
}
