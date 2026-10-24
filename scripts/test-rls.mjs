import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRls() {
  console.log('Testing RLS with Anonymous client...');

  // Attempt to select from orders table anonymously (should fail or return empty / error due to RLS)
  const { data, error } = await supabase.from('orders').select('*');

  if (error) {
    console.log('✅ Success: Anonymous select on orders blocked or returned error as expected.');
    console.log('Error details:', error.message);
  } else {
    console.log('⚠️ Result data length:', data?.length);
    if (data && data.length === 0) {
      console.log('✅ Success: Anonymous select on orders returned 0 rows due to RLS policies.');
    } else {
      console.log('❌ Warning: Anonymous user was able to read orders data!');
    }
  }
}

testRls();
