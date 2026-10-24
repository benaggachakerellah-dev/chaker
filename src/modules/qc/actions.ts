'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Submit QC Inspection for a batch
export async function submitInspection(batchId: string, inspectionData: {
  moisturePass: boolean;
  sizePass: boolean;
  insectsPass: boolean;
  packagingPass: boolean;
  expiryPass: boolean;
  notes: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Verify role is qc or admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['qc', 'admin'].includes(profile.role)) {
    throw new Error('Access denied: QC role required');
  }

  const allPassed =
    inspectionData.moisturePass &&
    inspectionData.sizePass &&
    inspectionData.insectsPass &&
    inspectionData.packagingPass &&
    inspectionData.expiryPass;

  const inspectionResult = allPassed ? 'passed' : 'failed';
  const batchStatus = allPassed ? 'approved' : 'rejected';

  // 1. Insert into quality_inspections
  const { data: inspection, error: inspError } = await supabase
    .from('quality_inspections')
    .insert({
      batch_id: batchId,
      inspector_id: user.id,
      status: inspectionResult,
      notes: inspectionData.notes,
      data_source: 'verified'
    })
    .select('id')
    .single();

  if (inspError) throw new Error('Failed to create inspection: ' + inspError.message);

  // 2. Insert into inspection_items (5 criteria)
  const items = [
    { criterion: 'moisture', passed: inspectionData.moisturePass },
    { criterion: 'size', passed: inspectionData.sizePass },
    { criterion: 'insects', passed: inspectionData.insectsPass },
    { criterion: 'packaging', passed: inspectionData.packagingPass },
    { criterion: 'expiry', passed: inspectionData.expiryPass },
  ];

  for (const item of items) {
    await supabase.from('inspection_items').insert({
      inspection_id: inspection.id,
      criterion: item.criterion,
      passed: item.passed,
      notes: item.passed ? 'Passed' : 'Failed criteria'
    });
  }

  // 3. Update batches.qc_status
  const { error: batchError } = await supabase
    .from('batches')
    .update({ qc_status: batchStatus })
    .eq('id', batchId);

  if (batchError) throw new Error('Failed to update batch status: ' + batchError.message);

  revalidatePath('/[locale]/qc', 'layout');
  return { success: true, status: batchStatus };
}

// Farm assigns approved batch to order item
export async function assignBatchToOrderItem(orderItemId: string, batchId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('order_items')
    .update({ batch_id: batchId })
    .eq('id', orderItemId);

  if (error) throw new Error('Failed to assign batch: ' + error.message);
  revalidatePath('/[locale]/farm', 'layout');
}

// Farm moves order to quality_check status
export async function moveOrderToQualityCheck(orderId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Trigger from Phase B2 will validate that all items have batches and batches are approved
  const { error } = await supabase
    .from('orders')
    .update({ status: 'quality_check' })
    .eq('id', orderId);

  if (error) throw new Error('Failed to move order to quality check: ' + error.message);

  await supabase.from('order_events').insert({
    order_id: orderId,
    status: 'quality_check',
    note: 'Moved to quality check by farm'
  });

  revalidatePath('/[locale]/farm', 'layout');
  return { success: true };
}
