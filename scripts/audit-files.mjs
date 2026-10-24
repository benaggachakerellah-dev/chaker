import fs from 'node:fs';

const filesToCheck = [
  'supabase/migrations/0000_enums.sql',
  'supabase/migrations/0001_profiles.sql',
  'supabase/migrations/0002_farms.sql',
  'supabase/migrations/0003_categories.sql',
  'supabase/migrations/0004_products.sql',
  'supabase/migrations/0005_product_variants.sql',
  'supabase/migrations/0006_inspection_locations.sql',
  'supabase/migrations/0007_batches.sql',
  'supabase/migrations/0008_quality_inspections.sql',
  'supabase/migrations/0009_inspection_items.sql',
  'supabase/migrations/0010_addresses.sql',
  'supabase/migrations/0011_carts.sql',
  'supabase/migrations/0012_cart_items.sql',
  'supabase/migrations/0013_orders.sql',
  'supabase/migrations/0014_order_items.sql',
  'supabase/migrations/0015_order_events.sql',
  'supabase/migrations/0016_shipments.sql',
  'supabase/migrations/0017_payments.sql',
  'supabase/migrations/0018_payouts.sql',
  'supabase/migrations/0019_reviews.sql',
  'supabase/migrations/0020_settings.sql',
  'supabase/migrations/0021_settings_seed.sql',
  'supabase/migrations/0022_notifications.sql'
];

// Also check locales if they exist
if (fs.existsSync('src/locales/ar.json')) {
  filesToCheck.push('src/locales/ar.json');
}

console.log('=== AUDITING FILES FOR ARABIC ENCODING ===');
let corruptCount = 0;

for (const filePath of filesToCheck) {
  if (!fs.existsSync(filePath)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  const presentation = (content.match(/[ﹰ-﻿]/g) || []).length;
  const arabic = (content.match(/[؀-ۿ]/g) || []).length;

  if (presentation > 0) {
    console.log(`❌ CORRUPT (Presentation forms found: ${presentation}): ${filePath}`);
    corruptCount++;
  } else if (arabic > 0) {
    console.log(`✅ CLEAN (Valid Arabic U+06xx: ${arabic}): ${filePath}`);
  } else {
    console.log(`⚪ NO ARABIC: ${filePath}`);
  }
}

console.log(`\nAudit complete. Found ${corruptCount} corrupt files.`);
