# Desert Gold - Premium Dates E-Commerce Marketplace

A premium e-commerce marketplace specializing in dates and date products from selected farms worldwide, featuring batch-level quality inspection, traceability, and marketplace administration.

## Features

- **Premium Storefront**: Responsive, beautiful UI showcasing premium dates and date products
- **Product Catalog**: Browse dates by variety (Medjool, Deglet Noor, Ajwa, etc.)
- **Farm Profiles**: Information about partner farms and their certifications
- **Batch Traceability**: Complete transparency with harvest dates, inspection results, and lab tests
- **Quality Inspection**: Batch-level inspection data including sugar content, moisture, size grading
- **Shopping Cart**: Add products to cart with quantity management
- **Product Details**: Comprehensive product information with full traceability data
- **Producer Dashboard**: (Planned) For farm partners to manage harvests and batches
- **Admin Dashboard**: (Planned) Marketplace administration and oversight
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18, TypeScript, React Router
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Icons**: Lucide React
- **Testing**: Playwright (e2e)
- **Database**: PostgreSQL + Supabase (configured but not connected yet)

## Project Structure

```
desert-gold/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Catalog.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ...
│   ├── context/           # React context providers
│   │   └── CartContext.tsx
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── data/              # Mock data
│   │   └── mockData.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/                 # Playwright e2e tests
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

## Development

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`.

### Type Checking

```bash
npm run type-check
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run E2E Tests

```bash
npm test
```

### Run Tests with UI

```bash
npm run test:ui
```

## Premium Design System

The design system uses a warm, premium color palette inspired by desert landscapes and fine dates:

- **Primary Gold**: `#D4A574` - Premium dates/dates products color
- **Dark Brown**: `#2D1810` - Premium, elegant background
- **Light Cream**: `#F5F0E8` - Clean, premium background
- **Accent Amber**: `#8B6F47` - Secondary accent

## Data & Types

### Core Types

- **Farm**: Partner farm information with certifications
- **DateVariety**: Date variety details (Medjool, Deglet Noor, etc.)
- **Batch**: Harvest batch with inspection data
- **InspectionData**: Lab test results and quality metrics
- **Product**: Marketplace product with full traceability
- **CartItem**: Shopping cart items
- **Order**: Customer orders

### Mock Data

Currently using mock data loaded from `src/data/mockData.ts` including:
- 2 partner farms (Al-Noor Estate, Deglet Valley)
- 3 date varieties (Medjool, Deglet Noor, Ajwa)
- 2 products with complete batch traceability

## Traceability & Quality Inspection

Every product includes:
- **Batch ID** with harvest date and farm origin
- **Inspection Data**:
  - Sugar content (Brix%)
  - Moisture percentage
  - Size grading (small/medium/large)
  - Lab test results (E. coli, Salmonella, Pesticides)
  - Inspector name
- **Certification**: ISO, Fair Trade, Organic, etc.

## Future Phases

- **Phase 2**: Producer Dashboard for farm partners
- **Phase 3**: Admin Dashboard and marketplace management
- **Phase 4**: PostgreSQL + Supabase integration
- **Phase 5**: User authentication and customer accounts
- **Phase 6**: Order management and checkout
- **Phase 7**: Full e-commerce and payment processing
- **Phase 8**: Analytics and reporting

## Database Configuration

Database integration (PostgreSQL + Supabase) is prepared but not yet connected. Configuration will be added in Phase 4.

## Testing

Playwright tests are configured but not yet implemented. Test suite will be built in parallel with feature development.

## License

MIT
