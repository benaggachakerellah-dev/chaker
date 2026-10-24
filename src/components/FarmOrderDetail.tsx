'use client';

import { useTransition } from 'react';
import { assignBatchToOrderItem, moveOrderToQualityCheck } from '@/modules/qc/actions';
import { useRouter } from 'next/navigation';

export default function FarmOrderDetail({ order, items, approvedBatches, locale }: { order: any; items: any[]; approvedBatches: any[]; locale: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-desert-dark">Manage Order {order.order_no}</h1>
        <p className="text-sm text-gray-500 mt-1">Status: <span className="font-bold capitalize">{order.status}</span></p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
        <h3 className="font-serif font-bold text-lg text-gray-900 border-b pb-3">Order Items & Batch Assignment</h3>

        {items.map(item => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-b border-gray-50">
            <div>
              <div className="font-bold text-gray-900">Product ID: {item.product_id}</div>
              <div className="text-xs text-gray-500">Quantity: {item.quantity} | Current Batch ID: {item.batch_id || 'None assigned'}</div>
            </div>

            <div className="flex items-center gap-3">
              <select
                defaultValue={item.batch_id || ''}
                onChange={(e) => {
                  const batchId = e.target.value;
                  startTransition(async () => {
                    try {
                      await assignBatchToOrderItem(item.id, batchId);
                      alert('Batch assigned successfully!');
                      router.refresh();
                    } catch (err: any) {
                      alert(err.message || 'Failed to assign batch');
                    }
                  });
                }}
                className="px-4 py-2 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-desert-gold"
              >
                <option value="">Select Approved Batch</option>
                {approvedBatches.map(b => (
                  <option key={b.id} value={b.id}>
                    Batch #{b.batch_number} ({b.remaining_qty} {b.unit} available)
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}

        <div className="pt-6 border-t flex justify-end">
          <button
            disabled={isPending || items.some(i => !i.batch_id)}
            onClick={() => {
              startTransition(async () => {
                try {
                  await moveOrderToQualityCheck(order.id);
                  alert('Order successfully moved to quality check!');
                  router.push(`/${locale}/farm`);
                } catch (err: any) {
                  alert(err.message || 'Failed to move order');
                }
              });
            }}
            className="bg-desert-gold text-white px-8 py-3 rounded-xl font-medium hover:bg-desert-gold/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move to Quality Check
          </button>
        </div>
      </div>
    </div>
  );
}
