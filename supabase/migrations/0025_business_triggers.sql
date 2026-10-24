-- ==========================================
-- BUSINESS RULES & TRIGGERS (0025_business_triggers.sql)
-- ==========================================

-- 1. TRIGGER FUNCTION: PREVENT SHIP WITHOUT INSPECTION & BATCH CHECK
CREATE OR REPLACE FUNCTION public.check_shipment_inspection()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
  batch_rec RECORD;
BEGIN
  -- If status is changing to 'shipped'
  IF NEW.status = 'shipped' AND OLD.status IS DISTINCT FROM 'shipped' THEN
    FOR item_record IN SELECT * FROM public.order_items WHERE order_id = NEW.id LOOP
      IF item_record.batch_id IS NULL THEN
        RAISE EXCEPTION 'Cannot ship order: item % is not linked to a batch.', item_record.id;
      END IF;

      SELECT qc_status INTO batch_rec FROM public.batches WHERE id = item_record.batch_id;
      IF batch_rec.qc_status IS DISTINCT FROM 'approved' THEN
        RAISE EXCEPTION 'Cannot ship order: batch % is not approved (status: %).', item_record.batch_id, batch_rec.qc_status;
      END IF;
    END LOOP;
  END IF;

  -- Also ensure batch_id is present when moving to quality_check or shipped
  IF NEW.status IN ('quality_check', 'shipped') AND OLD.status IS DISTINCT FROM NEW.status THEN
    FOR item_record IN SELECT * FROM public.order_items WHERE order_id = NEW.id LOOP
      IF item_record.batch_id IS NULL THEN
        RAISE EXCEPTION 'Cannot transition order to %: all items must be assigned a batch_id.', NEW.status;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_ship_without_inspection
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_shipment_inspection();


-- 2. TRIGGER FUNCTION: ORDER STATUS TRANSITION GUARD
-- Allowed transitions:
--   placed -> preparing, cancelled
--   preparing -> quality_check, cancelled
--   quality_check -> shipped, preparing (if rejected, goes back to preparing)
--   shipped -> delivered
--   (Any terminal states like delivered or cancelled cannot transition further)

CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'placed' THEN
    IF NEW.status NOT IN ('preparing', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid status transition from placed to %. Allowed: preparing, cancelled.', NEW.status;
    END IF;
  ELSIF OLD.status = 'preparing' THEN
    IF NEW.status NOT IN ('quality_check', 'cancelled') THEN
      RAISE EXCEPTION 'Invalid status transition from preparing to %. Allowed: quality_check, cancelled.', NEW.status;
    END IF;
  ELSIF OLD.status = 'quality_check' THEN
    IF NEW.status NOT IN ('shipped', 'preparing') THEN
      RAISE EXCEPTION 'Invalid status transition from quality_check to %. Allowed: shipped, preparing.', NEW.status;
    END IF;
  ELSIF OLD.status = 'shipped' THEN
    IF NEW.status NOT IN ('delivered') THEN
      RAISE EXCEPTION 'Invalid status transition from shipped to %. Allowed: delivered.', NEW.status;
    END IF;
  ELSIF OLD.status IN ('delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot transition order from terminal status %. Orders cannot be modified further.', OLD.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_order_status_transition
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_status_transition();
