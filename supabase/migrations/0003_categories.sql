CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  name_en TEXT,
  type TEXT NOT NULL CHECK (type IN ('variety', 'derivative')),
  parent_id UUID REFERENCES categories(id),
  data_source data_source NOT NULL DEFAULT 'synthetic'
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_type ON categories(type);
