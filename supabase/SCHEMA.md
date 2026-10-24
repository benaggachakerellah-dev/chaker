# Database Schema & Architecture: Desert Gold Marketplace

## 1. Overview of Tables (22 Tables) & Schema Audit

| Table Name | Has `id` PK | Has `created_at` | Has `updated_at` | Purpose / Key Columns |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | YES | YES | YES | Extends Supabase auth.users with roles (`role`, `phone`) |
| `farms` | YES | YES | YES | Producer profiles with Arabic name (`name_ar`), status, commission rate |
| `categories` | YES | NO | NO | Product varieties and derivatives (multilingual names) |
| `products` | YES | YES | YES | Core catalog items with required Arabic name (`name_ar`) and GIN index |
| `product_variants` | YES | NO | NO | Packaging weight, prices in DZD, SKU, stock quantity |
| `inspection_locations` | YES | NO | NO | Platform-owned QC inspection centers |
| `batches` | YES | YES | NO | Traceable batch lots with harvest/expiry dates and QC status |
| `quality_inspections` | YES | YES (inspected_at) | NO | Mandatory 5-point QC inspection records |
| `inspection_items` | YES | NO | NO | Individual criteria checks per inspection (`moisture`, `size`, etc.) |
| `addresses` | YES | NO | NO | Customer delivery addresses in Algeria |
| `carts` | YES | YES | NO | Active shopping cart container per user |
| `cart_items` | YES | NO | NO | Line items inside user shopping carts |
| `orders` | YES | YES | YES | Placed orders (`order_no`, `status`, `total`, `payment_method`) |
| `order_items` | YES | NO | NO | Snapshot items linked to farms and traceable batches |
| `order_events` | YES | YES | NO | Append-only audit trail of order state changes |
| `shipments` | YES | NO | NO | Carrier dispatch and delivery tracking (`shipped_at`, `delivered_at`) |
| `payments` | YES | NO | NO | Payment collection records (`method`, `amount`, `status`) |
| `payouts` | YES | NO | NO | Periodic financial disbursements to farms |
| `reviews` | YES | YES | NO | Customer reviews tied to verified orders and ratings (1-5) |
| `settings` | YES (PK is key) | NO | YES | Dynamic platform configuration key-value store |
| `notifications` | YES | YES | NO | Multi-channel user notifications (`in_app`, `email`, `sms`) |

---

## 2. ASCII ER Diagram

```
[auth.users] 1 -- 1 [profiles]
                        |
       +----------------+----------------+
       |                                 |
     [farms] 1 -- * [products]         [addresses] 1 -- * [orders]
       |              |                                    |
       |              1 -- * [product_variants]            |
       |                      |                            |
       |                      1 -- * [cart_items]          |
       |                              ^                    |
       |                              |                    |
       |                           [carts] 1 -- 1 [profiles] |
       |                                                   |
       +------------------- * [order_items] <--------------+
                             |       |                     |
                             |     [batches]               |
                             |        |                    |
                             |        1 -- * [quality_inspections]
                             |                     |
                             |                     1 -- * [inspection_items]
                             |
                             +-- 1 [orders] 1 -- * [order_events]
                             |              1 -- 1 [shipments]
                             |              1 -- 1 [payments]
                             |              1 -- * [reviews]
                             |
                           [payouts] (linked to farms)
```

---

## 3. Key Architectural Decisions

### Encoding Safety
All migration SQL files and localization JSON files are encoded in **UTF-8 without BOM**. Windows PowerShell operations writing files with non-ASCII characters (such as Arabic descriptions and names) explicitly specify `-Encoding utf8`. Verification is performed using `type <file> | Select-String` to confirm correct forward rendering (e.g., `'نسبة العمولة الافتراضية'`).

### Required Arabic Names (`name_ar`)
To enforce an authentic Arabic-first marketplace experience, both `farms` and `products` require `name_ar TEXT NOT NULL`. Optional French (`name_fr`) and English (`name_en`) fields are provided for bilingual localization. Full-text search on products utilizes PostgreSQL GIN indexes with Arabic dictionary configurations.

### `data_source` Governance
Every core table includes a `data_source` enum (`'synthetic'` or `'verified'`) to distinguish demo seed records from live production data.

### Nullable `order_items.batch_id`
`batch_id` on `order_items` is initialized as `NULL` upon order placement and populated during fulfillment (`preparing`) when verified batches passing QC are assigned.

### Immutable `order_events` & Dynamic `settings`
`order_events` provides an append-only audit trail. The `settings` table provides dynamic platform configurations (commission rates, return window, max COD value) replacing hardcoded constants.

---

## 4. Security & RLS

### Helper Function
`auth.user_role()` fetches the user role from `public.profiles` using `auth.uid()`.

### Row Level Security (RLS) Policies
- **Profiles & Addresses:** Users can only view/modify their own profiles and addresses. Admins have full access.
- **Farms:** Approved farms are public. Farm owners can manage their own farms. Admins have full access.
- **Catalog (Categories, Products, Variants):** Public read for active items. Farm owners manage their own items. Admins have full access.
- **Batches & QC:** Traceability data is public only when `qc_status = 'approved'`. Farm owners manage their batches. QC and admins manage inspections.
- **Orders & Order Items:** Customers see their own orders/items. Farms see order items tied to their farm ID. Admins have full access.
- **Reviews:** Public read for approved reviews. Customers can insert a review only for delivered orders, once per product per order.

### Database Triggers & Business Rules
1. **`prevent_ship_without_inspection` (`orders` BEFORE UPDATE):** Ensures that when an order status changes to `shipped`, all associated order items are linked to a non-null batch whose `qc_status` is `approved`. Also enforces batch assignment for `quality_check` and `shipped` states.
2. **`enforce_order_status_transition` (`orders` BEFORE UPDATE):** Enforces strict finite state machine transitions for orders (`placed` → `preparing`/`cancelled`, `preparing` → `quality_check`/`cancelled`, `quality_check` → `shipped`/`preparing`, `shipped` → `delivered`).

---

## 5. Verification Status
- **Supabase Cloud (`desert-gold-dev`) Connection:** CONNECTED. All migrations (0000 to 0025) applied successfully. Verified 22 tables, RLS enabled on all tables, helper function, policies, and business triggers active. Arabic encoding verified.
