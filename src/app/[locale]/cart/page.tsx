import { getCart } from '@/modules/orders/actions';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import CartItemRow from '@/components/CartItemRow';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function CartPage({ params }: { params: { locale: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const { items } = await getCart();

  const subtotal = items.reduce((sum, item) => sum + (item.product_variants?.price_dzd || 0) * item.quantity, 0);
  const shippingFee = items.length > 0 ? 500.00 : 0;
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-serif font-bold text-desert-dark mb-8">{t('cart.title', locale)}</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg mb-6">{t('cart.empty', locale)}</p>
          <Link href={`/${locale}/catalog`} className="bg-desert-gold text-white px-8 py-3 rounded-xl font-medium hover:bg-desert-gold/90 transition inline-block">
            {t('common.catalog', locale)}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {items.map(item => (
              <CartItemRow key={item.id} item={item} locale={locale} />
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
            <h3 className="font-serif font-bold text-lg text-gray-900 border-b pb-3">{t('checkout.orderSummary', locale)}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.subtotal', locale)}</span>
              <span className="font-medium">{subtotal.toFixed(2)} DZD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('cart.shipping', locale)}</span>
              <span className="font-medium">{shippingFee.toFixed(2)} DZD</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
              <span>{t('cart.total', locale)}</span>
              <span className="text-desert-gold">{total.toFixed(2)} DZD</span>
            </div>

            <Link
              href={`/${locale}/checkout`}
              className="w-full bg-desert-dark text-white py-4 rounded-xl font-medium hover:bg-desert-dark/90 transition block text-center mt-6"
            >
              {t('cart.checkout', locale)}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
