'use client';

import { useTransition } from 'react';
import { placeOrder } from '@/modules/orders/actions';
import { useRouter } from 'next/navigation';

export default function CheckoutForm({ locale, items, subtotal }: { locale: string; items: any[]; subtotal: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const shippingFee = 500.00;
  const total = subtotal + shippingFee;

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
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h2 className="font-serif font-bold text-xl text-gray-900 border-b pb-3">Shipping Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input required name="fullName" type="text" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-desert-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input required name="phone" type="tel" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-desert-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region / Wilaya</label>
            <input required name="region" type="text" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-desert-gold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input required name="city" type="text" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-desert-gold" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input required name="street" type="text" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-desert-gold" />
          </div>
        </div>

        <div className="pt-6 border-t">
          <h3 className="font-bold text-gray-900 mb-2">Payment Method</h3>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
            <span className="text-2xl">💵</span>
            <div>
              <div className="font-bold text-amber-900">Cash on Delivery (COD)</div>
              <div className="text-xs text-amber-700">Pay securely when your order arrives at your door.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
        <h3 className="font-serif font-bold text-lg text-gray-900 border-b pb-3">Order Summary</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-xs text-gray-600">
              <span>{i.product_variants?.products?.name_ar} (x{i.quantity})</span>
              <span>{(i.product_variants?.price_dzd * i.quantity).toFixed(2)} DZD</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{subtotal.toFixed(2)} DZD</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping Fee</span>
          <span className="font-medium">{shippingFee.toFixed(2)} DZD</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
          <span>Total</span>
          <span className="text-desert-gold">{total.toFixed(2)} DZD</span>
        </div>

        <button
          disabled={isPending}
          type="submit"
          className="w-full bg-desert-dark text-white py-4 rounded-xl font-medium hover:bg-desert-dark/90 transition block text-center mt-6"
        >
          {isPending ? 'Placing Order...' : 'Confirm Order'}
        </button>
      </div>
    </form>
  );
}
