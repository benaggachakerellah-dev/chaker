CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  name_en TEXT,
  region TEXT NOT NULL,
  description TEXT,
  certificates JSONB DEFAULT '[]',
  status farm_status NOT NULL DEFAULT 'pending',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00
    CHECK (commission_rate >= 5 AND commission_rate <= 15),
  data_source data_source NOT NULL DEFAULT 'synthetic',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_farms_owner_id ON farms(owner_id);
CREATE INDEX idx_farms_status ON farms(status);
