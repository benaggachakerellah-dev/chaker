'use client';

import { useTransition } from 'react';
import { updateCartQuantity, removeFromCart } from '@/modules/orders/actions';

export default function CartItemRow({ item, locale }: { item: any; locale: string }) {
  const [isPending, startTransition] = useTransition();
  const variant = item.product_variants;
  const product = variant?.products;
  const productName = locale === 'fr' ? product?.name_fr : locale === 'en' ? product?.name_en : product?.name_ar;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center text-2xl">
          🌴
        </div>
        <div>
          <h4 className="font-serif font-bold text-gray-900">{productName}</h4>
          <span className="text-xs text-gray-500">SKU: {variant?.sku} | {variant?.weight_grams}g</span>
          <div className="text-desert-gold font-bold mt-1">{variant?.price_dzd} DZD</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center border rounded-lg overflow-hidden">
          <button
            disabled={isPending}
            onClick={() => {
              startTransition(() => updateCartQuantity(item.id, item.quantity - 1));
            }}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
          >
            -
          </button>
          <span className="px-4 py-1 text-sm font-medium">{item.quantity}</span>
          <button
            disabled={isPending}
            onClick={() => {
              startTransition(() => updateCartQuantity(item.id, item.quantity + 1));
            }}
            className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
          >
            +
          </button>
        </div>

        <div className="font-bold text-gray-900 w-24 text-right">
          {(variant?.price_dzd * item.quantity).toFixed(2)} DZD
        </div>

        <button
          disabled={isPending}
          onClick={() => {
            startTransition(() => removeFromCart(item.id));
          }}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
