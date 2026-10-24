import 'dotenv/config';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Number of tables:', res.rows.length);
  res.rows.forEach(r => console.log('- ' + r.table_name));
  await client.end();
}

main().catch(e => console.error(e.message));