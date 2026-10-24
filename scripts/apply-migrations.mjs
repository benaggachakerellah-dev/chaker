import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const connectionString = process.env.DATABASE_URL;
  const cleanUrl = connectionString.replace('desert-project@99', encodeURIComponent('desert-project@99'));

  const client = new Client({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔗 Connected to Supabase Cloud database.');

    const newMigrations = [
      '0023_helpers.sql',
      '0024_rls_policies.sql',
      '0025_business_triggers.sql'
    ];

    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');

    for (const file of newMigrations) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ Applied migration: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Failed migrating ${file}: ${err.message}`);
        process.exit(1);
      }
    }

    console.log('\n✨ All Phase B2 migrations applied successfully!');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
