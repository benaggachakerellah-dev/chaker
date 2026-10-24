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
  const res = await client.query('SELECT count(*) FROM public.products');
  console.log('Total products in cloud DB:', res.rows[0].count);
  
  const activeRes = await client.query('SELECT count(*) FROM public.products WHERE is_active = true');
  console.log('Active products:', activeRes.rows[0].count);
  
  const farmsRes = await client.query('SELECT count(*) FROM public.farms WHERE status = \'approved\'');
  console.log('Approved farms:', farmsRes.rows[0].count);
  
  await client.end();
}
run().catch(e => console.error(e.message));
