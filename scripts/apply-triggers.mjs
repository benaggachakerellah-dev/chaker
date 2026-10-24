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

const trigger1Sql = `
CREATE OR REPLACE FUNCTION check_shipment_inspection() RETURNS TRIGGER AS $$
DECLARE
  unapproved_count INT;
BEGIN
  IF NEW.status = 'shipped' THEN
    SELECT COUNT(*) INTO unapproved_count
    FROM order_items oi
    JOIN batches b ON oi.batch_id = b.id
    WHERE oi.order_id = NEW.id AND b.qc_status != 'approved';
    
    IF unapproved_count > 0 THEN
      RAISE EXCEPTION 'Cannot ship order: some items are linked to unapproved batches.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_ship_without_inspection ON orders;
CREATE TRIGGER prevent_ship_without_inspection
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION check_shipment_inspection();
`;

const trigger2Sql = `
CREATE OR REPLACE FUNCTION enforce_order_status_transition() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'placed' AND NEW.status NOT IN ('preparing', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  ELSIF OLD.status = 'preparing' AND NEW.status NOT IN ('quality_check', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  ELSIF OLD.status = 'quality_check' AND NEW.status NOT IN ('shipped', 'preparing') THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  ELSIF OLD.status = 'shipped' AND NEW.status != 'delivered' THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_order_status_transition ON orders;
CREATE TRIGGER enforce_order_status_transition
BEFORE UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION enforce_order_status_transition();
`;

async function run() {
  await client.connect();
  console.log('Connected to database');
  
  try {
    await client.query('BEGIN');
    await client.query(trigger1Sql);
    await client.query(trigger2Sql);
    await client.query('COMMIT');
    console.log('✅ Triggers applied successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Error applying triggers:', e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
