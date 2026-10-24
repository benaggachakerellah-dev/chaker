# Strategic Re-Calibration Plan: Desert Gold E-Commerce Marketplace

**Date:** October 21, 2026  
**Project:** Desert Gold (Marketplace for Premium Dates)  
**Status:** Strategic Re-Calibration Awaiting Final Owner Approval (No Code Changes)  

---

## 1. Gap Analysis

| TRD Area | TRD Requirement | Current Repository | Gap Severity | Salvageability |
|---|---|---|---|---|
| **Tech Stack** | Next.js (App Router) + TypeScript + Tailwind CSS + Supabase + zod + Vercel + Sentry | Vite + React 18 SPA + TypeScript + Tailwind CSS | **CRITICAL** | **Not Salvageable** (SPA routing vs Next.js App Router) |
| **Architecture** | Modular Monolith (`src/app`, `src/modules/*`, `src/lib`) | Flat single-page structure (`src/pages`, `src/components`) | **CRITICAL** | **Not Salvageable** (Requires complete directory restructuring) |
| **Localization (i18n)** | Arabic-only UI, full RTL layout, Tajawal or Cairo font | English-only UI, LTR layout, sans-serif font | **CRITICAL** | **OWNER DECISION OVERRIDES TRD** (Expanded to Arabic + French + English) |
| **Currency** | DZD (Algerian Dinar), fixed for launch | USD (`$`), fixed for launch | **MAJOR** | **Partially** (Pricing logic needs currency swap) |
| **Roles & Permissions** | 4 roles (`customer`, `farm`, `qc`, `admin`) in `profiles.role`, RLS enforced | None (guest session only) | **CRITICAL** | **Not Salvageable** (Requires Supabase auth & RLS schema) |
| **Database Schema** | 17 explicit tables (profiles, farms, categories, products, etc.) | In-memory mock arrays (`mockData.ts`) | **CRITICAL** | **Not Salvageable** (Needs SQL migrations & Supabase) |
| **Business Rules** | Server-enforced rule: No order reaches `shipped` unless batch inspection is `approved` | None | **CRITICAL** | **Not Salvageable** (Needs Server Actions / DB constraints) |
| **Order Lifecycle** | `placed` → `preparing` → `quality_check` → `shipped` → `delivered` (+ cancelled/returned) | Basic demo checkout simulation | **MAJOR** | **Partially** (UI flow concepts reusable) |
| **QC Workflow** | 5 mandatory criteria (moisture, size, insects, packaging, expiry) + photo + rejection reason | Basic tabular mock inspection | **MAJOR** | **Partially** (Inspection data structure concepts reusable) |
| **Payments** | Cash on delivery (`method='cod'`), recorded on delivery | Simulated demo order reference | **MAJOR** | **Partially** (Checkout UI flow adaptable) |
| **Security** | RLS on every table, service_role on server only, Zod validation, 5MB image limit | None | **CRITICAL** | **Not Salvageable** (Requires Supabase security policies) |
| **Testing** | Vitest (business logic) + Playwright (E2E per role) + Security tests per table | Playwright E2E tests (SPA only, 9 tests) | **MAJOR** | **Partially** (E2E test concepts adaptable to Next.js) |
| **Environments** | Local / Staging / Production (separate Supabase projects) | Single local Vite dev server | **MAJOR** | **Partially** (Environment config structure adaptable) |

---

## 2. Salvage Assessment

### Current Repository File Classification:
- `src/App.tsx` — **DISCARD** (Next.js App Router replaces custom React Router SPA)
- `src/main.tsx` — **DISCARD** (Next.js handles app entry)
- `index.html` — **DISCARD** (Next.js root layout replaces index.html)
- `vite.config.ts` — **DISCARD** (Replaced by Next.js & Tailwind config)
- `src/index.css` — **PORT** (Tailwind CSS imports and design tokens can be adapted for RTL/Arabic)
- `src/types/index.ts` — **PORT** (Domain models like Product, Farm, Batch provide a strong starting point for TypeScript interfaces & Zod schemas)
- `src/data/mockData.ts` — **PORT** (Sample product seed data adaptable for database seed scripts)
- `src/context/CartContext.tsx` — **PORT** (Cart state management logic adaptable for Next.js / Supabase carts)
- `src/components/Navbar.tsx` — **PORT** (Component layout concepts reusable, needs RTL & i18n translation)
- `src/components/Footer.tsx` — **PORT** (Component layout reusable, needs RTL & i18n translation)
- `src/pages/Home.tsx` — **PORT** (UI layout concepts reusable, needs i18n)
- `src/pages/Catalog.tsx` — **PORT** (Catalog grid & filter concepts reusable)
- `src/pages/ProductDetail.tsx` — **PORT** (Product detail & traceability layout reusable)
- `src/pages/Cart.tsx` — **PORT** (Cart & checkout UI concepts reusable)
- `src/pages/Traceability.tsx` — **PORT** (Traceability inspection view concepts reusable)
- `src/pages/Farms.tsx` — **PORT** (Farm listing concepts reusable)
- `tests/marketplace.spec.ts` — **PORT** (Playwright test assertions adaptable for Next.js routes)
- `playwright.config.ts` — **PORT** (Playwright configuration adaptable)
- `package.json` — **DISCARD** (Will be replaced with Next.js dependencies, Supabase client, Vitest, Zod, etc.)
- `AUDIT_REPORT.md`, `PHASE1_IMPLEMENTATION_REPORT.md` — **KEEP AS-IS** (Valuable historical audit trail)

---

## 3. Recommended Path & Repository Layout

**Recommended Path: (B) Keep the Vite app as reference (`/prototype`) and start a fresh Next.js app in the same repo.**

### Repository Layout Decision: Option (A)
- **Action:** Move the existing Vite prototype app into `E:\DesertGold\prototype\` via `git mv` (preserving complete commit history). Initialize the new Next.js App Router project at the `E:\DesertGold\` root.
- **Justification:** Keeps the root clean for production Next.js deployment on Vercel while keeping the Phase 1 reference prototype fully intact in a dedicated subfolder. An `ARCHITECTURE.md` file will be created in Phase A documenting how to run the prototype independently (`cd prototype && npm install && npm run dev`).

---

## 4. Redefined Phases

### Phase A: Foundation (Estimated Effort: 3 days)
- **Goal:** Initialize Next.js 14+ (App Router) project with TypeScript, Tailwind CSS, multi-language support (Arabic, French, English), RTL/LTR dynamic shell, and strict i18n/Tailwind lint rules.
- **Deliverables:** 
  - Next.js project scaffold at root; Vite prototype moved to `prototype/`.
  - Modular directory structure (`src/modules/*`, `src/app/[locale]/*`, `src/lib/*`).
  - **A2. Internationalization (i18n) Foundation:**
    - Locale-prefixed routes: `/ar`, `/fr`, `/en`.
    - Locale dictionary files in `src/locales/{ar,fr,en}.json`.
    - Server and client-safe `t(key)` translation function.
    - `LanguageSwitcher` component that preserves the current path and switches locale.
    - Dynamic `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>` layout wrapper.
    - Font configuration: Tajawal/Cairo for Arabic (`lang="ar"`), Inter for Latin (`lang="fr"`, `lang="en"`).
  - Navbar, Footer, and core design tokens.
- **Acceptance Criteria:**
  1. App builds successfully.
  2. `/ar` renders RTL with Arabic typography; `/fr` and `/en` render LTR with Inter typography.
  3. No Arabic, French, or English string is hardcoded in any `.tsx` file. All user-visible text goes through `t()`. Verified by automated grep over `src/app` and `src/components` for Unicode ranges or unlocalized literals.
  4. No directional Tailwind classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`) are used. Only logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`). Verified by automated grep.
  5. **Phase A Unit Testing:** Vitest unit test suite covering `t()` function (correct string returned for ar/fr/en, graceful fallback to ar on missing key).
  6. **Phase A Manual Checklist:** Verification of all 3 locales across mobile and desktop viewports.

### Phase B: Data Layer & Supabase (Estimated Effort: 4 days)
- **Goal:** Set up Supabase project, write 17 database migrations, define RLS policies, and configure Zod validation schemas.
- **Deliverables:** SQL migration files for all 17 tables, RLS security policies per role, TypeScript type definitions, Supabase client wrapper, Zod validation schemas.
- **Acceptance Criteria:** All migrations execute successfully in local Supabase instance; RLS restricts access correctly by role (`customer`, `farm`, `qc`, `admin`).

### Phase C: Catalog & Product Browsing (Estimated Effort: 3 days)
- **Goal:** Implement public product catalog, categories, search, and detailed product view in Arabic, French, and English.
- **Deliverables:** Catalog page, category filters, search bar, product detail page, dynamic server/client components.
- **Acceptance Criteria:** Users can browse products across all 3 locales, filter by category/variety, and view product details.

### Phase D: Cart & COD Checkout (Estimated Effort: 4 days)
- **Goal:** Implement shopping cart, stock reservation, and Cash on Delivery (COD) order creation in DZD currency.
- **Deliverables:** Cart management (Supabase/Cookies), checkout form (address selection, COD payment method), order creation server action.
- **Acceptance Criteria:** Users can add items to cart, place a COD order in DZD, and view order confirmation. Return window policy set to 7 days (stored in settings).

### Phase E: QC Workflow & Business Rules (Estimated Effort: 4 days)
- **Goal:** Implement QC inspection workflow (5 mandatory criteria + photo + rejection note) and server-enforced shipping guard rule.
- **Deliverables:** QC dashboard/form, quality inspection database records, server action guarding order status transition to `shipped`.
- **Acceptance Criteria:** QC role can inspect batches; system blocks any order from reaching `shipped` unless batch inspection is `approved`.

### Phase F: Farm & Admin Dashboards (Estimated Effort: 5 days)
- **Goal:** Build farm producer dashboard (harvest/batch management, payouts) and admin dashboard (marketplace oversight, commission rates).
- **Deliverables:** Farm dashboard views, admin oversight panels, commission calculation logic.
- **Acceptance Criteria:** Farm users can manage their batches and view orders; admin users can manage commission rates and view platform analytics.

### Phase G: Reviews, Notifications & Tracking (Estimated Effort: 3 days)
- **Goal:** Implement post-delivery reviews (within 7-day return/review window), in-app notifications, and customer order tracking timeline.
- **Deliverables:** Review submission form (restricted to delivered orders), notification center, order status tracker.
- **Acceptance Criteria:** Customers can track orders through lifecycle and leave verified reviews upon delivery.

### Phase H: Testing, Security & Vercel Deployment (Estimated Effort: 3 days)
- **Goal:** Implement Vitest unit tests, Playwright E2E tests per role across locales, RLS security policy tests, and production deployment to Vercel.
- **Deliverables:** Vitest business logic test suite, Playwright role-based E2E tests (`customer`, `farm`, `qc`, `admin`), Vercel deployment pipeline.
- **Acceptance Criteria:** All unit, integration, and Playwright tests pass; application deployed and verified on Vercel staging environment.

---

## 5. Open Decisions & Temporary Assumptions

| Open Question | Temporary Assumption for Development | Non-Final Status Note |
|---|---|---|
| **Languages** | Arabic (`ar`) + French (`fr`) + English (`en`) | **Owner decision, overrides TRD**. Arabic is primary RTL; French and English are secondary LTR. |
| **Launch Country / Market** | Algeria (Algiers region pilot) | Configurable region setting; can be expanded later. |
| **Currency** | DZD (Algerian Dinar) | Hardcoded currency symbol and formatting utils. |
| **Commission Rate** | Default 10% stored in `farms.commission_rate` | Adjustable per farm in admin panel. |
| **Return Window** | 7 days post-delivery (per TRD) | Stored in application settings table/config, not hardcoded. |
| **QC Location** | Central consolidation warehouse (Algiers Hub) | Placeholder location in inspection metadata. |
| **Font Family** | Tajawal/Cairo for Arabic, Inter for Latin | Configured in Tailwind theme. |

---

## 6. Risk Register & Mitigation

1. **Risk:** RTL layout bugs and text truncation in Arabic UI components.  
   **Mitigation:** Establish RTL layout shell (`dir="rtl"`) from Phase A and test all flex/grid containers with long Arabic strings early.
2. **Risk:** Strict database RLS policies blocking legitimate queries during development.  
   **Mitigation:** Write comprehensive RLS test scripts in Phase B to verify role access before building UI features.
3. **Risk:** Server-side order shipping guard rule bypassed or incorrectly wired.  
   **Mitigation:** Implement strict Zod validation and database constraints (check constraints / triggers) alongside Server Actions.
4. **Risk:** Scope creep when building 4 distinct role dashboards (Customer, Farm, QC, Admin).  
   **Mitigation:** Strictly adhere to the phased roadmap, prioritizing MVP workflows per role in Phases C–F.
5. **Risk:** Next.js App Router caching behavior masking real-time order status updates.  
   **Mitigation:** Utilize appropriate revalidation tags and server action cache invalidations (`revalidatePath`).
6. **Risk:** **i18n string drift** (missing translation keys across `ar.json`, `fr.json`, and `en.json`).  
   **Mitigation:** Implement an automated validation script `npm run i18n:check` in Phase A that scans all locale files and fails the build if key sets do not match identically.

---

## Changelog

- **Correction 1 (Multi-Language):** Updated TRD Gap Analysis, Phase A deliverables & acceptance criteria, added section *A2. Internationalization (i18n) Foundation*, and updated Open Decisions table to reflect owner decision supporting Arabic (`ar`, RTL), French (`fr`, LTR), and English (`en`, LTR).
- **Correction 2 (Repo Layout for `/prototype`):** Selected Option (A) — moving the existing Vite prototype to `prototype/` via `git mv` and initializing Next.js at root. Added note on `ARCHITECTURE.md` instructions.
- **Correction 3 (Return Window):** Corrected return window from 3 days to 7 days in Open Decisions and noted setting storage.
- **Addition 1 (Hardcoded String Prohibition):** Added Acceptance Criterion #11 requiring zero hardcoded strings and verified via automated grep.
- **Addition 2 (Logical Tailwind Properties):** Added Acceptance Criterion #12 requiring logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) and verified via automated grep.
- **Addition 3 (Phase A Testing):** Added requirement for a Vitest unit test for `t()` and a manual i18n browser checklist in Phase A.
- **Addition 4 (Risk #6 - i18n String Drift):** Added Risk #6 and mitigation script `npm run i18n:check`.
