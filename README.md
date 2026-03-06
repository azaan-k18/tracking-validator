# Tracking Validator

Config-driven tracking QA using Playwright and ES modules, with a Next.js dashboard and MongoDB persistence.

## Stack
- Node.js 20+
- Playwright
- MongoDB
- Express API
- Next.js dashboard

## Quick Start (Local)
```bash
npm install
cd dashboard && npm install
cd ..
npm run dev
```

Services:
- Dashboard: `http://localhost:3000`
- API: `http://localhost:5000`

## Environment
Root env (`.env`):
```env
PORT=5000
SERVER_HOST=0.0.0.0
MONGO_URI=mongodb://127.0.0.1:27017/projectdb
MONGO_DB_NAME=projectdb
```

Dashboard env (`dashboard/.env`):
```env
BACKEND_INTERNAL_URL=http://10.10.11.97:5000
NEXT_PUBLIC_API_BASE_URL=/backend
VITE_API_BASE_URL=/backend
```

## Scripts
- `npm run dev`: runs backend + dashboard together
- `npm run server`: backend only
- `npm run validate -- --site <siteKey>`: run crawler validator
- `npm run docker:start`: `docker compose up --build`
- `npm run docker:stop`: `docker compose down`

## Docker
```bash
docker compose up --build
```

Then open:
- `http://<SERVER_IP>:3000`

See full deployment details in `DEPLOYMENT.md`.
