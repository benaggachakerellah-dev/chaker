import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
config({ path: resolve(projectRoot, '.env.local') });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  await client.connect();
  
  const users = [
    { email: 'customer@desertgold.com', password: 'password123', role: 'customer', fullName: 'Test Customer' },
    { email: 'farm@desertgold.com', password: 'password123', role: 'farm', fullName: 'Test Farm Owner' },
    { email: 'admin@desertgold.com', password: 'password123', role: 'admin', fullName: 'Test Admin' },
  ];

  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.fullName }
    });

    if (error && !error.message.includes('already exists')) {
      console.error('Error creating user:', u.email, error.message);
      continue;
    }

    const userId = data?.user?.id;
    if (!userId) continue;

    // Insert or update profile
    await client.query(`
      INSERT INTO public.profiles (id, full_name, role, phone)
      VALUES ($1, $2, $3, '+2135550000')
      ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, full_name = EXCLUDED.full_name
    `, [userId, u.fullName, u.role]);

    // If role is 'farm', create a farm for this user
    if (u.role === 'farm') {
      const farmRes = await client.query(`SELECT id FROM public.farms WHERE owner_id = $1`, [userId]);
      if (farmRes.rows.length === 0) {
        await client.query(`
          INSERT INTO public.farms (owner_id, name, name_ar, name_fr, name_en, region, status, commission_rate, data_source)
          VALUES ($1, 'Test Farm', 'مزرعة اختبار', 'Ferme Test', 'Test Farm', 'Algiers', 'approved', 10.00, 'synthetic')
        `, [userId]);
      }
    }

    console.log('✅ Seeded user:', u.email, 'Role:', u.role);
  }

  console.log('--- DONE ---');
  await client.end();
}

seed().catch(e => console.error(e));
