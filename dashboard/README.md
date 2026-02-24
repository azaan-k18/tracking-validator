# Tracking Validator Dashboard

## Setup
```bash
cd dashboard
npm install
npm run dev
```

Then open:
- http://localhost:3000

## API dependency
Dashboard expects backend API running at:
- http://localhost:4000

Available endpoints consumed:
- GET /api/runs
- GET /api/runs/:id
- GET /api/runs/:id/pages
- GET /api/runs/:id/events
- GET /api/runs/:id/rules

## Dashboard Architecture
- Homepage: `app/page.tsx`
- Run detail page: `app/runs/[id]/page.tsx`
- Rule results table: `components/RuleStatusTable.tsx`
- Pages table: `components/PageTable.tsx`
- Theme provider and persistence: `components/theme/ThemeProvider.tsx`
- Theme toggle: `components/ThemeToggle.tsx`
- API calls: `services/api.ts`
- Provider name mapping: `utils/providerNames.ts`
- Global styles and utility classes: `styles/globals.css`

## Extend in future
- Add filters in `components/RunsDashboard.tsx`.
- Add new API methods in `services/api.ts`.
- Add new provider display names in `utils/providerNames.ts`.
- Add visual variants in `styles/globals.css` and consume them in `components/`.
