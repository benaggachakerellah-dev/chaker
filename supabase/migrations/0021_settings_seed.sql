INSERT INTO settings (key, value, description_ar, description_fr, description_en) VALUES
  ('commission.default_rate', '10.00'::jsonb, 'نسبة العمولة الافتراضية', 'Taux de commission par défaut', 'Default commission rate'),
  ('commission.min_rate', '5.00'::jsonb, 'الحد الأدنى للعمولة', 'Taux de commission minimum', 'Minimum commission rate'),
  ('commission.max_rate', '15.00'::jsonb, 'الحد الأقصى للعمولة', 'Taux de commission maximum', 'Maximum commission rate'),
  ('returns.window_days', '7'::jsonb, 'فترة الإرجاع بالأيام', 'Fenêtre de retour en jours', 'Return window in days'),
  ('orders.max_cod_value_dzd', '50000'::jsonb, 'الحد الأقصى لقيمة الدفع عند الاستلام بالدينار', 'Valeur maximale du paiement à la livraison en DZD', 'Maximum COD order value in DZD');
