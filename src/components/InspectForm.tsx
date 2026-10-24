'use client';

import { useState, useTransition } from 'react';
import { submitInspection } from '@/modules/qc/actions';
import { useRouter } from 'next/navigation';

export default function InspectForm({ batch, locale }: { batch: any; locale: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [moisturePass, setMoisturePass] = useState(true);
  const [sizePass, setSizePass] = useState(true);
  const [insectsPass, setInsectsPass] = useState(true);
  const [packagingPass, setPackagingPass] = useState(true);
  const [expiryPass, setExpiryPass] = useState(true);
  const [notes, setNotes] = useState('');

  const farmName = locale === 'fr' ? batch.farms?.name_fr : locale === 'en' ? batch.farms?.name_en : batch.farms?.name_ar;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          try {
            const res = await submitInspection(batch.id, {
              moisturePass,
              sizePass,
              insectsPass,
              packagingPass,
              expiryPass,
              notes,
            });
            alert(`Inspection submitted successfully! Result: ${res.status}`);
            router.push(`/${locale}/qc`);
          } catch (err: any) {
            alert(err.message || 'Failed to submit inspection');
          }
        });
      }}
      className="space-y-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-3xl mx-auto"
    >
      <div>
        <h2 className="font-serif font-bold text-2xl text-gray-900">Batch Inspection #{batch.batch_number}</h2>
        <p className="text-sm text-gray-500 mt-1">Producer Farm: {farmName} | Quantity: {batch.quantity} {batch.unit}</p>
      </div>

      <div className="space-y-4 border-t border-b py-6">
        <h3 className="font-bold text-gray-900">5-Point QC Criteria</h3>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="font-medium text-sm">Moisture Level</span>
          <select value={moisturePass ? 'true' : 'false'} onChange={e => setMoisturePass(e.target.value === 'true')} className="px-4 py-1.5 border rounded-lg text-sm font-medium">
            <option value="true">Pass</option>
            <option value="false">Fail</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="font-medium text-sm">Size / Grade</span>
          <select value={sizePass ? 'true' : 'false'} onChange={e => setSizePass(e.target.value === 'true')} className="px-4 py-1.5 border rounded-lg text-sm font-medium">
            <option value="true">Pass</option>
            <option value="false">Fail</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="font-medium text-sm">Visible Insects</span>
          <select value={insectsPass ? 'true' : 'false'} onChange={e => setInsectsPass(e.target.value === 'true')} className="px-4 py-1.5 border rounded-lg text-sm font-medium">
            <option value="true">Pass</option>
            <option value="false">Fail</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="font-medium text-sm">Packaging Condition</span>
          <select value={packagingPass ? 'true' : 'false'} onChange={e => setPackagingPass(e.target.value === 'true')} className="px-4 py-1.5 border rounded-lg text-sm font-medium">
            <option value="true">Pass</option>
            <option value="false">Fail</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
          <span className="font-medium text-sm">Expiry Date Valid</span>
          <select value={expiryPass ? 'true' : 'false'} onChange={e => setExpiryPass(e.target.value === 'true')} className="px-4 py-1.5 border rounded-lg text-sm font-medium">
            <option value="true">Pass</option>
            <option value="false">Fail</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Inspector Notes</label>
        <textarea
          required={!moisturePass || !sizePass || !insectsPass || !packagingPass || !expiryPass}
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Enter detailed notes or reasons for failure..."
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-desert-gold"
        />
      </div>

      <button
        disabled={isPending}
        type="submit"
        className="w-full bg-desert-dark text-white py-4 rounded-xl font-medium hover:bg-desert-dark/90 transition"
      >
        {isPending ? 'Submitting...' : 'Submit Inspection Result'}
      </button>
    </form>
  );
}
