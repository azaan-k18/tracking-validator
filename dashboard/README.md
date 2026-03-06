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

Configure in `dashboard/.env`:
```env
BACKEND_INTERNAL_URL=http://10.10.11.97:5000
NEXT_PUBLIC_API_BASE_URL=/backend
VITE_API_BASE_URL=/backend
```

`/backend` requests are proxied by Next.js to `BACKEND_INTERNAL_URL`.

Available endpoints consumed:
- GET `/api/runs?site=<siteKey>&environment=<env>`
- GET `/api/runs/:id`
- GET `/api/runs/:id/pages`
- GET `/api/runs/:id/events`
- GET `/api/runs/:id/rules`
- POST `/api/build`
