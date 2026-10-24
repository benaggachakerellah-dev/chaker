CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description_ar TEXT,
  description_fr TEXT,
  description_en TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
