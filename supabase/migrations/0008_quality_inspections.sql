CREATE TABLE quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES batches(id),
  inspector_id UUID NOT NULL REFERENCES profiles(id),
  result batch_status NOT NULL,
  notes TEXT,
  inspected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_source data_source NOT NULL DEFAULT 'synthetic',
  CONSTRAINT result_is_approved_or_rejected CHECK (result IN ('approved', 'rejected')),
  CONSTRAINT rejection_requires_notes CHECK (result = 'approved' OR notes IS NOT NULL)
);

CREATE INDEX idx_quality_inspections_batch_id ON quality_inspections(batch_id);
CREATE INDEX idx_quality_inspections_inspector_id ON quality_inspections(inspector_id);
CREATE INDEX idx_quality_inspections_inspected_at ON quality_inspections(inspected_at);
