'use client';

import { useTransition } from 'react';
import { addToCart } from '@/modules/orders/actions';

export default function AddToCartButton({ variantId, label }: { variantId: string; label: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          try {
            await addToCart(variantId, 1);
            alert('Added to cart successfully!');
          } catch (e: any) {
            alert(e.message || 'Error adding to cart');
          }
        });
      }}
      disabled={isPending}
      className="w-full bg-desert-dark text-white py-4 rounded-xl font-medium hover:bg-desert-dark/90 transition flex items-center justify-center gap-2"
    >
      <span>🛒</span> {isPending ? 'Adding...' : label}
    </button>
  );
}
