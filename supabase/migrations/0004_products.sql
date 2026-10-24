CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  name_ar TEXT NOT NULL,
  name_fr TEXT,
  name_en TEXT,
  description TEXT,
  grade product_grade NOT NULL,
  origin_region TEXT,
  farming farming_method NOT NULL,
  is_active BOOLEAN DEFAULT true,
  data_source data_source NOT NULL DEFAULT 'synthetic',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_farm_id ON products(farm_id);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_name_ar ON products USING gin(to_tsvector('arabic', name_ar));
