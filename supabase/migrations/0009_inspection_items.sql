CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES quality_inspections(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL CHECK (criterion IN ('moisture', 'size', 'insects', 'packaging', 'expiry')),
  passed BOOLEAN NOT NULL,
  value TEXT,
  photo_url TEXT,
  CONSTRAINT uq_inspection_criterion UNIQUE (inspection_id, criterion)
);

CREATE INDEX idx_inspection_items_inspection_id ON inspection_items(inspection_id);
