CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id),
  location_id UUID NOT NULL REFERENCES inspection_locations(id),
  harvest_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  quantity_kg NUMERIC(10,2) NOT NULL CHECK (quantity_kg > 0),
  qc_status batch_status NOT NULL DEFAULT 'pending',
  data_source data_source NOT NULL DEFAULT 'synthetic',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT expiry_after_harvest CHECK (expiry_date > harvest_date)
);

CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_location_id ON batches(location_id);
CREATE INDEX idx_batches_qc_status ON batches(qc_status);
CREATE INDEX idx_batches_batch_code ON batches(batch_code);
