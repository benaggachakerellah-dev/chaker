import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CustomerProfilePage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const isAr = locale === 'ar';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth`);

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', user.id);

  async function updateProfile(formData: FormData) {
    'use server';
    const supabaseServer = createClient();
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;

    const { data: { user: currentUser } } = await supabaseServer.auth.getUser();
    if (!currentUser) return;

    await supabaseServer.from('profiles').update({ full_name: fullName, phone }).eq('id', currentUser.id);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <Link href={`/${locale}/account/orders`} className="text-xs font-medium text-[#67402D] hover:underline">
          ← {isAr ? 'العودة إلى الطلبات' : 'Back to Orders'}
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#35251C] mt-2">
          {isAr ? 'الملف الشخصي' : 'My Profile'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isAr ? 'إدارة بيانات حسابك وعناوين الشحن' : 'Manage your account details and shipping addresses'}
        </p>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg p-8 shadow-subtle space-y-6">
        <h2 className="font-serif font-bold text-lg text-[#35251C] border-b border-[#E7DED1] pb-3">
          {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
        </h2>
        <form action={updateProfile} className="space-y-4 max-w-lg">
          <Input label={isAr ? 'الاسم الكامل' : 'Full Name'} name="fullName" defaultValue={profile?.full_name || ''} />
          <Input label={isAr ? 'رقم الهاتف' : 'Phone Number'} name="phone" defaultValue={profile?.phone || ''} />
          <Button type="submit" size="sm">
            {isAr ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </form>
      </div>

      <div className="bg-white border border-[#E7DED1] rounded-lg p-8 shadow-subtle space-y-6">
        <h2 className="font-serif font-bold text-lg text-[#35251C] border-b border-[#E7DED1] pb-3">
          {isAr ? 'عناوين الشحن المحفوظة' : 'Saved Addresses'}
        </h2>
        {addresses && addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr: any) => (
              <div key={addr.id} className="border border-[#E7DED1] rounded-lg p-4 space-y-1 text-sm bg-[#F7F3EB]/30">
                <div className="font-bold text-[#35251C]">{addr.recipient} ({addr.phone})</div>
                <div className="text-gray-600">{addr.street}, {addr.city}, {addr.region}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">{isAr ? 'لا توجد عناوين محفوظة.' : 'No saved addresses found.'}</p>
        )}
      </div>
    </div>
  );
}
