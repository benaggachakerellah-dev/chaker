import { createClient } from '@/lib/supabase/server';
import { Locale, locales } from '@/lib/i18n/config';
import { t } from '@/lib/i18n/t';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { submitReview } from '@/modules/reviews/actions';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const ORDER_STEPS = ['placed', 'preparing', 'quality_check', 'shipped', 'delivered'];

export default async function OrderDetailPage({ params }: { params: { locale: string; id: string } }) {
  const locale = (locales.includes(params.locale as Locale) ? params.locale : 'ar') as Locale;
  const supabase = createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product_variants (
          id,
          sku,
          weight_grams,
          products (id, name_ar, name_fr, name_en)
        )
      ),
      order_events (*)
    `)
    .eq('id', params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const currentStepIndex = ORDER_STEPS.indexOf(order.status);
  const isDelivered = order.status === 'delivered';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link href={`/${locale}/account/orders`} className="text-sm text-desert-gold hover:underline">
          ← {locale === 'ar' ? 'العودة إلى الطلبات' : 'Back to Orders'}
        </Link>
        <h1 className="text-3xl font-serif font-bold text-desert-dark mt-2">Order {order.order_no}</h1>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-serif font-bold text-lg mb-6 text-gray-900">{t('orders.timeline', locale)}</h3>
        <div className="flex items-center justify-between relative">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCompleted ? 'bg-desert-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {idx + 1}
                </div>
                <span className="text-xs font-medium text-gray-700 mt-2 capitalize">{step.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-serif font-bold text-lg text-gray-900 border-b pb-3">Items & Reviews</h3>
            {order.order_items?.map((item: any) => {
              const product = item.product_variants?.products;
              return (
                <div key={item.id} className="py-4 border-b border-gray-50 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold text-gray-900">{product?.name_ar || product?.name_en}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity} | Unit Price: {item.unit_price} DZD</div>
                    </div>
                    <div className="font-bold text-gray-900">{(item.unit_price * item.quantity).toFixed(2)} DZD</div>
                  </div>

                  {/* Leave Review Form if Delivered */}
                  {isDelivered && product && (
                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100 space-y-3">
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Leave a Product Review</h4>
                      <form action={async (formData) => {
                        'use server';
                        const rating = Number(formData.get('rating')) || 5;
                        const comment = formData.get('comment') as string;
                        await submitReview(order.id, product.id, rating, comment);
                      }} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-gray-700">Rating (1-5):</label>
                          <select name="rating" defaultValue="5" className="px-3 py-1.5 border rounded-lg text-sm bg-white">
                            <option value="5">5 ⭐⭐⭐⭐⭐</option>
                            <option value="4">4 ⭐⭐⭐⭐</option>
                            <option value="3">3 ⭐⭐⭐</option>
                            <option value="2">2 ⭐⭐</option>
                            <option value="1">1 ⭐</option>
                          </select>
                        </div>
                        <textarea
                          name="comment"
                          rows={2}
                          placeholder="Write your review about the taste, quality, and packaging..."
                          className="w-full p-3 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-desert-gold"
                          required
                        />
                        <button type="submit" className="bg-desert-gold text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-desert-gold/90 transition">
                          Submit Review
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
          <h3 className="font-serif font-bold text-lg text-gray-900 border-b pb-3">Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{order.subtotal} DZD</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">{order.shipping_fee} DZD</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
            <span>Total</span>
            <span className="text-desert-gold">{order.total_amount} DZD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
