-- ==========================================
-- RLS POLICIES MIGRATION (0024_rls_policies.sql)
-- ==========================================

-- 1. PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner or admin" ON profiles FOR SELECT USING (id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Profiles updatable by owner (name/phone)" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Profiles insertable by trigger/admin" ON profiles FOR INSERT WITH CHECK (id = auth.uid() OR auth.user_role() = 'admin');

-- 2. FARMS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved farms are public" ON farms FOR SELECT USING (status = 'approved' OR owner_id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Farm owners can update own farm" ON farms FOR UPDATE USING (owner_id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Farm owners or admins can insert farm" ON farms FOR INSERT WITH CHECK (owner_id = auth.uid() OR auth.user_role() = 'admin');

-- 3. CATEGORIES, PRODUCTS, PRODUCT_VARIANTS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON categories FOR ALL USING (auth.user_role() = 'admin');

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products public read" ON products FOR SELECT USING (is_active = true OR auth.user_role() = 'admin' OR farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));
CREATE POLICY "Farm owners manage own products" ON products FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()) OR auth.user_role() = 'admin');

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active variants public read" ON product_variants FOR SELECT USING (is_active = true OR auth.user_role() = 'admin' OR product_id IN (SELECT p.id FROM products p JOIN farms f ON p.farm_id = f.id WHERE f.owner_id = auth.uid()));
CREATE POLICY "Farm owners manage own variants" ON product_variants FOR ALL USING (product_id IN (SELECT p.id FROM products p JOIN farms f ON p.farm_id = f.id WHERE f.owner_id = auth.uid()) OR auth.user_role() = 'admin');

-- 4. BATCHES, QUALITY_INSPECTIONS, INSPECTION_ITEMS
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved batches public traceability, farms/qc/admin read" ON batches FOR SELECT USING (qc_status = 'approved' OR auth.user_role() IN ('qc', 'admin') OR farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));
CREATE POLICY "Farm owners and qc/admin manage batches" ON batches FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()) OR auth.user_role() IN ('qc', 'admin'));

ALTER TABLE quality_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quality inspections read access" ON quality_inspections FOR SELECT USING (auth.user_role() IN ('qc', 'admin') OR batch_id IN (SELECT id FROM batches WHERE farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())));
CREATE POLICY "QC and admin manage inspections" ON quality_inspections FOR ALL USING (auth.user_role() IN ('qc', 'admin'));

ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inspection items read access" ON inspection_items FOR SELECT USING (auth.user_role() IN ('qc', 'admin') OR inspection_id IN (SELECT qi.id FROM quality_inspections qi JOIN batches b ON qi.batch_id = b.id JOIN farms f ON b.farm_id = f.id WHERE f.owner_id = auth.uid()));
CREATE POLICY "QC and admin manage inspection items" ON inspection_items FOR ALL USING (auth.user_role() IN ('qc', 'admin'));

-- 5. CARTS & CART_ITEMS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own cart" ON carts FOR ALL USING (user_id = auth.uid() OR auth.user_role() = 'admin');

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own cart items" ON cart_items FOR ALL USING (cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid()) OR auth.user_role() = 'admin');

-- 6. ADDRESSES
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers own addresses" ON addresses FOR ALL USING (user_id = auth.uid() OR auth.user_role() = 'admin');

-- 7. INSPECTION_LOCATIONS
ALTER TABLE inspection_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inspection locations public read" ON inspection_locations FOR SELECT USING (true);
CREATE POLICY "Inspection locations admin write" ON inspection_locations FOR ALL USING (auth.user_role() = 'admin');

-- 8. ORDERS & ORDER_ITEMS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customer or farm or admin order read" ON orders FOR SELECT USING (customer_id = auth.uid() OR auth.user_role() = 'admin' OR id IN (SELECT order_id FROM order_items oi JOIN farms f ON oi.farm_id = f.id WHERE f.owner_id = auth.uid()));
CREATE POLICY "Customer create own orders" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Customer or admin update orders" ON orders FOR UPDATE USING (customer_id = auth.uid() OR auth.user_role() = 'admin');

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order items viewable by parties" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()) OR auth.user_role() = 'admin' OR farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));
CREATE POLICY "Order items insert update admin/customer" ON order_items FOR ALL USING (auth.user_role() = 'admin' OR order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));

-- 9. ORDER_EVENTS
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Order events viewable by involved parties" ON order_events FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()) OR auth.user_role() = 'admin' OR order_id IN (SELECT order_id FROM order_items oi JOIN farms f ON oi.farm_id = f.id WHERE f.owner_id = auth.uid()));
CREATE POLICY "Order events insert admin or system" ON order_events FOR INSERT WITH CHECK (auth.user_role() IN ('admin', 'qc') OR true);

-- 10. SHIPMENTS, PAYMENTS, PAYOUTS
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shipments viewable by parties" ON shipments FOR SELECT USING (auth.user_role() IN ('admin', 'qc') OR order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()) OR order_id IN (SELECT order_id FROM order_items oi JOIN farms f ON oi.farm_id = f.id WHERE f.owner_id = auth.uid()));
CREATE POLICY "Admin manage shipments" ON shipments FOR ALL USING (auth.user_role() = 'admin');

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments admin and owner" ON payments FOR SELECT USING (auth.user_role() = 'admin' OR order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid()));
CREATE POLICY "Payments admin manage" ON payments FOR ALL USING (auth.user_role() = 'admin');

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payouts admin and farm owner" ON payouts FOR SELECT USING (auth.user_role() = 'admin' OR farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));
CREATE POLICY "Payouts admin manage" ON payouts FOR ALL USING (auth.user_role() = 'admin');

-- 11. REVIEWS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews public read" ON reviews FOR SELECT USING (is_approved = true OR user_id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Customers insert review for delivered order" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid() AND order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid() AND status = 'delivered'));
CREATE POLICY "Admin manage reviews" ON reviews FOR UPDATE USING (auth.user_role() = 'admin');

-- 12. SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings public read" ON settings FOR SELECT USING (true);
CREATE POLICY "Settings admin manage" ON settings FOR ALL USING (auth.user_role() = 'admin');

-- 13. NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications owner view" ON notifications FOR SELECT USING (user_id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Notifications owner update" ON notifications FOR UPDATE USING (user_id = auth.uid() OR auth.user_role() = 'admin');
CREATE POLICY "Notifications insert system" ON notifications FOR INSERT WITH CHECK (true);
