import { getCart } from '@/modules/orders/actions';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import { redirect } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CheckoutPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const { items } = await getCart();

  if (!items || items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product_variants?.price_dzd || 0) * item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-serif font-bold text-desert-dark mb-8">{t('checkout.title', locale)}</h1>
      <CheckoutForm locale={locale} items={items} subtotal={subtotal} />
    </div>
  );
}
