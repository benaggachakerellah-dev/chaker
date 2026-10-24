# Architecture: Desert Gold Marketplace

## 1. App Router & Localization Strategy
Desert Gold uses Next.js 14+ App Router with explicit locale-prefixed routes (`/ar`, `/fr`, `/en`). 
- **Why Locale Prefix?** It ensures clean server-side rendering, robust SEO indexing across 3 languages (Arabic, French, English), and straightforward middleware redirection from root (`/` → `/ar`).
- **RTL & LTR Handling:** The root layout dynamically sets `<html lang={locale} dir={directionMap[locale]}>`, applying Tajawal/Cairo fonts for Arabic (`dir="rtl"`) and Inter for French/English (`dir="ltr"`).

## 2. Modular Monolith Architecture
To maintain high maintainability and prepare for future team scaling, code is organized as a Modular Monolith under `src/modules/`:
- `catalog/`: Products, categories, search, filtering.
- `orders/`: Cart, checkout (COD), order lifecycle.
- `quality/`: QC workflow & mandatory inspection rules.
- `farms/`: Producer management & harvests.
- `reviews/`: Customer feedback & ratings.
- `shared/`: Cross-module utilities.
- **Strict Boundary Rule:** Modules do not import internals from other modules directly; cross-module access is strictly routed through each module's public barrel export (`index.ts`).

## 3. Future Supabase & Security Integration
Database interactions will be orchestrated via Supabase (PostgreSQL + RLS) using `@supabase/ssr` and client/server wrappers in `src/lib/supabase/`. All database tables enforce Row Level Security (RLS) restricting operations by role (`customer`, `farm`, `qc`, `admin`).
