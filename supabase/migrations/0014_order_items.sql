CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  farm_id UUID NOT NULL REFERENCES farms(id),
  batch_id UUID REFERENCES batches(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
  commission_amount NUMERIC(10,2) NOT NULL CHECK (commission_amount >= 0)
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX idx_order_items_farm_id ON order_items(farm_id);
CREATE INDEX idx_order_items_batch_id ON order_items(batch_id);
