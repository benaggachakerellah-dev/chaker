import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pkg;

async function verify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    console.log('=== TASK 2: ARABIC ENCODING ===');
    const settingsRes = await client.query('SELECT key, description_ar FROM settings ORDER BY key;');
    settingsRes.rows.forEach(r => {
      console.log(`${r.key}: ${r.description_ar}`);
    });

    console.log('\n=== TASK 3: KEY CONSTRAINTS ===');

    // 1. order_items.batch_id nullable
    const r1 = await client.query(`
      SELECT is_nullable
      FROM information_schema.columns
      WHERE table_name='order_items' AND column_name='batch_id';
    `);
    console.log('1. order_items.batch_id is_nullable:', r1.rows[0]?.is_nullable);

    // 2. products.name_ar exists
    const r2 = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='products' AND column_name='name_ar';
    `);
    console.log('2. products.name_ar rows returned:', r2.rows.length);

    // 3. user_role enum values
    const r3 = await client.query(`
      SELECT enumlabel
      FROM pg_enum
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'user_role'
      ORDER BY enumsortorder;
    `);
    console.log('3. user_role enum values:', r3.rows.map(r => r.enumlabel).join(', '));

  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await client.end();
  }
}

verify();
