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
  console.table(fnRes.rows);

  console.log('=== TASK 2: RLS POLICIES COUNT ===');
  const rlsRes = await client.query(`
    SELECT tablename, count(*) AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename;
  `);
  console.table(rlsRes.rows);

  await client.end();
}

verify().catch(console.error);
