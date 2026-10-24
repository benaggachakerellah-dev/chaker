CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  package_weight_g INTEGER NOT NULL CHECK (package_weight_g > 0),
  price_dzd NUMERIC(10,2) NOT NULL CHECK (price_dzd > 0),
  sku TEXT UNIQUE NOT NULL,
  stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  data_source data_source NOT NULL DEFAULT 'synthetic'
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
