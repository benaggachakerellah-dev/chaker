import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function FarmSettingsPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: farm } = await supabase.from('farms').select('*').eq('owner_id', user.id).single();

  async function updateFarm(formData: FormData) {
    'use server';
    const supabaseServer = createClient();
    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) return;

    const name = formData.get('name') as string;
    const region = formData.get('region') as string;
    const description = formData.get('description') as string;

    await supabaseServer.from('farms').update({
      name,
      region,
      description
    }).eq('owner_id', currentUser.id);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <Link href={`/${locale}/farm/dashboard`} className="text-xs font-medium text-[#67402D] hover:underline">
          ← {isAr ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#35251C] mt-2">
          {isAr ? 'إعدادات المزرعة' : 'Farm Settings'}
        </h1>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg p-8 shadow-subtle space-y-6">
        <form action={updateFarm} className="space-y-4">
          <Input required label={isAr ? 'اسم المزرعة' : 'Farm Name'} name="name" defaultValue={farm?.name || ''} />
          <Input required label={isAr ? 'المنطقة' : 'Region'} name="region" defaultValue={farm?.region || ''} />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#35251C]">{isAr ? 'وصف المزرعة' : 'Description'}</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={farm?.description || ''}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E7DED1] rounded-lg text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="py-2.5">
            {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
}
