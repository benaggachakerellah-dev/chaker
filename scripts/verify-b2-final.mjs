import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
config({ path: resolve(projectRoot, '.env.local') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
  await client.connect();

  console.log('=== TASK 1: HELPER FUNCTIONS ===');
  const fnRes = await client.query(`
    SELECT n.nspname, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname IN ('user_role', 'current_user_role', 'current_user_farm_id');
  `);
  fnRes.rows.forEach(r => console.log(`${r.nspname}.${r.proname}`));

  console.log('\n=== TASK 2: RLS POLICIES COUNT ===');
  const rlsRes = await client.query(`
    SELECT tablename, count(*) AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename;
  `);
  rlsRes.rows.forEach(r => console.log(`${r.tablename}: ${r.policy_count} policies`));

  console.log('\n=== TASK 3: CLEANUP COUNTS ===');
  const oCount = await client.query('SELECT count(*) FROM orders');
  const oiCount = await client.query('SELECT count(*) FROM order_items');
  const bCount = await client.query('SELECT count(*) FROM batches');
  console.log(`orders: ${oCount.rows[0].count}`);
  console.log(`order_items: ${oiCount.rows[0].count}`);
  console.log(`batches: ${bCount.rows[0].count}`);

  await client.end();
}

verify().catch(console.error);
