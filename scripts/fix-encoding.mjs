import fs from 'node:fs';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const { Client } = pkg;

async function executeTasks() {
  console.log('=== TASK 1: DIAGNOSIS ===');
  const buf = fs.readFileSync('supabase/migrations/0021_settings_seed.sql');
  const str = buf.toString('utf8');
  const arabic = (str.match(/[؀-ۿ]/g) || []);
  const presentation = (str.match(/[ﹰ-﻿]/g) || []);
  console.log('File bytes:', buf.length);
  console.log('Arabic chars (U+0600-06FF):', arabic.length);
  console.log('Presentation forms (U+FE70-FEFF):', presentation.length);
  if (arabic.length > 0) {
    console.log('First Arabic sample codepoints:', arabic.slice(0, 10).map(c => c.codePointAt(0).toString(16)));
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  const dbRes = await client.query("SELECT key, encode(convert_to(description_ar, 'UTF8'), 'hex') as hex FROM settings;");
  console.log('Database hex output:');
  dbRes.rows.forEach(r => console.log(`${r.key}: ${r.hex}`));

  console.log('\n=== TASK 2: REWRITE 0021_settings_seed.sql ===');
  const newSql = `INSERT INTO settings (key, value, description_ar, description_fr, description_en) VALUES
('commission.default_rate', '10.00'::jsonb, 'نسبة العمولة الافتراضية', 'Taux de commission par défaut', 'Default commission rate'),
('commission.min_rate', '5.00'::jsonb, 'الحد الأدنى لنسبة العمولة', 'Taux de commission minimum', 'Minimum commission rate'),
('commission.max_rate', '15.00'::jsonb, 'الحد الأقصى لنسبة العمولة', 'Taux de commission maximum', 'Maximum commission rate'),
('returns.window_days', '7'::jsonb, 'فترة الإرجاع المسموحة بالأيام', 'Fenêtre de retour en jours', 'Return window in days'),
('orders.max_cod_value_dzd', '50000'::jsonb, 'الحد الأقصى لقيمة الدفع عند الاستلام', 'Valeur maximale de paiement à la livraison en DZD', 'Maximum cash on delivery value in DZD');
`;
  fs.writeFileSync('supabase/migrations/0021_settings_seed.sql', newSql, 'utf8');

  const check = fs.readFileSync('supabase/migrations/0021_settings_seed.sql', 'utf8');
  const sample = check.match(/'نسبة[^']*'/);
  console.log('Sample:', sample ? sample[0] : 'NOT FOUND');
  console.log('First codepoint of نسبة:', sample ? sample[0].codePointAt(1).toString(16) : 'N/A');

  console.log('\n=== TASK 3: FIX THE DATABASE ===');
  await client.query('DELETE FROM settings;');
  await client.query(newSql);
  console.log('Settings re-seeded.');

  const finalRes = await client.query('SELECT key, description_ar FROM settings ORDER BY key;');
  console.log('Fresh query output from settings:');
  finalRes.rows.forEach(r => {
    console.log(`${r.key}: ${r.description_ar}`);
  });

  await client.end();
}

executeTasks().catch(err => console.error('Error:', err));
