import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

config({ path: resolve(projectRoot, '.env.local') });

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('❌ DATABASE_URL is still not defined after loading .env.local');
  console.error('   Checked path:', resolve(projectRoot, '.env.local'));
  console.error('   Does the file exist?', require('node:fs').existsSync(resolve(projectRoot, '.env.local')));
  process.exit(1);
}

try {
  const parsed = new URL(url);
  console.log('🔍 Diagnostics:');
  console.log('   Host:', parsed.hostname);
  console.log('   Port:', parsed.port);
  console.log('   User:', parsed.username);
  console.log('   Database:', parsed.pathname);
  console.log('   Password length:', parsed.password.length);
  console.log('   Password has special chars:', /[^a-zA-Z0-9]/.test(parsed.password));
} catch (e) {
  console.error('❌ Invalid DATABASE_URL format:', e.message);
  process.exit(1);
}

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});

async function main() {
  console.log('\n🔌 Connecting...');
  await client.connect();
  console.log('✅ Connected to database');

  const version = await client.query('SELECT version()');
  console.log('PostgreSQL:', version.rows[0].version.substring(0, 60));

  const tables = await client.query(
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'"
  );
  console.log('Tables in public schema:', tables.rows[0].count);

  await client.end();
  console.log('\n✅ All checks passed');
}

main().catch((e) => {
  console.error('\n❌ FAILED');
  console.error('   Error name:', e.name);
  console.error('   Error message:', e.message || '(empty)');
  console.error('   Error code:', e.code || '(no code)');
  process.exit(1);
});