# Tracking Validator Dashboard

## Setup
```bash
cd dashboard
npm install
npm run dev
```

Dashboard default URL:
- `http://localhost:3000`

## API configuration
Dashboard API calls are environment-driven.

<<<<<<< Updated upstream
Available endpoints consumed:
- GET /api/runs?site=<siteKey>&environment=<env>
- GET /api/runs/:id
- GET /api/runs/:id/pages
- GET /api/runs/:id/events
- GET /api/runs/:id/rules
- POST /api/build

## Dashboard Architecture
- Homepage: `app/page.tsx`
- Run detail page: `app/runs/[id]/page.tsx`
- Global app layout: `app/layout.tsx`
- Global loading UIs: `app/loading.tsx`, `app/runs/[id]/loading.tsx`
- Rule results table: `components/RuleStatusTable.tsx`
- Pages table: `components/PageTable.tsx`
- Events table: `components/EventTable.tsx`
- Header: `components/layout/Header.tsx`
- Domain navbar: `components/layout/Navbar.tsx`
- Environment selector drawer: `components/layout/EnvironmentDrawer.tsx`
- Build trigger widget: `components/widgets/BuildNowCard.tsx`
- Theme provider and persistence: `context/ThemeContext.tsx`
- Environment state: `context/EnvironmentContext.tsx`
- Domain state: `context/DomainContext.tsx`
- Provider composer: `context/AppProviders.tsx`
- API calls: `services/api.ts`
- Server-side run detail calls: `services/serverApi.ts`
- Provider name mapping: `utils/providerNames.ts`
- Date/time formatting utilities: `utils/dateFormat.ts`
- Domain options: `utils/domains.ts`
- Environment options: `utils/environments.ts`
- Global styles and utility classes: `styles/globals.css`

## Features
- Domain + environment driven runs dashboard.
- Persistent theme toggle (localStorage).
- Persistent domain/environment selectors (localStorage).
- Run detail page server-fetches data bundle for faster navigation.
- Page table:
  - collapsed by default (`Show Pages` / `Hide Pages`)
  - client-side filters: `All`, `Section`, `Article`
- Event table:
  - URL column filter dropdown with checkboxes
  - multi-select filtering
  - `Select All` / `Clear`
- Build trigger widget:
  - calls `POST /api/build` with selected domain/environment
  - non-blocking API trigger
  - shows loading state + success/error toasts

## Extend in future
- Add homepage metrics/cards in `components/RunsDashboard.tsx`.
- Add detail widgets in `components/RunDetailDashboard.tsx`.
- Add new API methods in `services/api.ts`.
- Add new provider display names in `utils/providerNames.ts`.
- Add visual variants in `styles/globals.css` and consume them in `components/`.
=======
Configure in `dashboard/.env`:
```env
BACKEND_INTERNAL_URL=http://10.10.11.97:5000
NEXT_PUBLIC_API_BASE_URL=/backend
VITE_API_BASE_URL=/backend
```

`/backend` requests are proxied by Next.js to `BACKEND_INTERNAL_URL`.
>>>>>>> Stashed changes
