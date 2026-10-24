'use client';

import { useTransition } from 'react';
import { placeOrder } from '@/modules/orders/actions';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function CheckoutForm({ locale, items, subtotal }: { locale: string; items: any[]; subtotal: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const shippingFee = 500.00;
  const total = subtotal + shippingFee;
  const isAr = locale === 'ar';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
          fullName: formData.get('fullName') as string,
          phone: formData.get('phone') as string,
          region: formData.get('region') as string,
          city: formData.get('city') as string,
          street: formData.get('street') as string,
        };

        startTransition(async () => {
          try {
            const res = await placeOrder(data);
            alert(`Order placed successfully! Order No: ${res.orderNo}`);
            router.push(`/${locale}/account/orders`);
          } catch (err: any) {
            alert(err.message || 'Failed to place order');
          }
        });
      }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-subtle border border-[#E7DED1] space-y-6">
        <h2 className="font-serif font-bold text-lg text-[#35251C] border-b border-[#E7DED1] pb-3">
          {isAr ? 'عنوان الشحن' : 'Shipping Address'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input required label={isAr ? 'الاسم الكامل' : 'Full Name'} name="fullName" type="text" />
          <Input required label={isAr ? 'رقم الهاتف' : 'Phone Number'} name="phone" type="tel" />
          <Input required label={isAr ? 'الولاية / المنطقة' : 'Region / Wilaya'} name="region" type="text" />
          <Input required label={isAr ? 'المدينة' : 'City'} name="city" type="text" />
          <div className="sm:col-span-2">
            <Input required label={isAr ? 'العنوان بالتفصيل' : 'Street Address'} name="street" type="text" />
          </div>
        </div>

        <div className="pt-6 border-t border-[#E7DED1]">
          <h3 className="font-bold text-sm text-[#35251C] mb-3">{isAr ? 'طريقة الدفع' : 'Payment Method'}</h3>
          <div className="bg-[#F7F3EB] border border-[#E7DED1] p-4 rounded-lg flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <div className="font-bold text-[#35251C] text-sm">{isAr ? 'الدفع نقداً عند الاستلام (COD)' : 'Cash on Delivery (COD)'}</div>
              <div className="text-xs text-gray-600">{isAr ? 'ادفع بكل أمان عند استلام طلبك.' : 'Pay securely when your order arrives.'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-subtle border border-[#E7DED1] h-fit space-y-4">
        <h3 className="font-serif font-bold text-base text-[#35251C] border-b border-[#E7DED1] pb-3">
          {isAr ? 'ملخص الطلب' : 'Order Summary'}
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-xs text-gray-600">
              <span>{i.product_variants?.products?.name_ar || 'Product'} (x{i.quantity})</span>
              <span>{(i.product_variants?.price_dzd * i.quantity).toFixed(2)} DZD</span>
            </div>
          ))}
        </div>
        <div className="border-t border-[#E7DED1] pt-3 flex justify-between text-sm">
          <span className="text-gray-600">{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
          <span className="font-medium">{subtotal.toFixed(2)} DZD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{isAr ? 'رسوم الشحن' : 'Shipping Fee'}</span>
          <span className="font-medium">{shippingFee.toFixed(2)} DZD</span>
        </div>
        <div className="border-t border-[#E7DED1] pt-3 flex justify-between font-bold text-base text-[#35251C]">
          <span>{isAr ? 'المجموع' : 'Total'}</span>
          <span className="text-[#67402D]">{total.toFixed(2)} DZD</span>
        </div>

        <Button
          disabled={isPending}
          type="submit"
          className="w-full py-3.5 mt-4"
        >
          {isPending ? (isAr ? 'جاري تأكيد الطلب...' : 'Placing Order...') : (isAr ? 'تأكيد الطلب' : 'Confirm Order')}
        </Button>
      </div>
    </form>
  );
}
