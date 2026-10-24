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

async function run() {
  await client.connect();

  const fnRes = await client.query(`
    SELECT n.nspname, p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname IN ('user_role', 'current_user_role', 'current_user_farm_id');
  `);
  console.log('--- TASK 1 ---');
  console.log(JSON.stringify(fnRes.rows, null, 2));

  const rlsRes = await client.query(`
    SELECT tablename, count(*) AS policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY tablename;
  `);
  console.log('--- TASK 2 ---');
  console.log(JSON.stringify(rlsRes.rows, null, 2));

  await client.end();
}

run();
