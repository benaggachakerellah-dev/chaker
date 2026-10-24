CREATE TABLE inspection_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  name_en TEXT,
  region TEXT NOT NULL,
  address TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  data_source data_source NOT NULL DEFAULT 'synthetic'
);

CREATE INDEX idx_inspection_locations_region ON inspection_locations(region);
CREATE INDEX idx_inspection_locations_is_active ON inspection_locations(is_active);
