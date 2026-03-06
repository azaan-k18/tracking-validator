# Tracking Validator

<<<<<<< Updated upstream
Config-driven tracking QA using Playwright and ES6 JavaScript.

## What it does
- Crawls a site with breadth-first traversal.
- Captures network requests for configured providers.
- Parses provider parameters into normalized fields.
- Runs validation rules in the same execution run.
- Persists run data to files or MongoDB.
- Exposes dashboard-ready run APIs via Express.
- Sends aggregated email alerts when rules fail.
=======
Config-driven tracking QA using Playwright and ES modules, with a Next.js dashboard and MongoDB persistence.
>>>>>>> Stashed changes

## Stack
- Node.js 20+
- Playwright
- MongoDB
- Express API
- Next.js dashboard

<<<<<<< Updated upstream
## Project structure
- `config/sites.js`: Site registry (start URL, crawl patterns, expected accounts).
- `config/base.config.js`: Shared config + dynamic site config builder.
- `config/default.config.js`: Standalone default config.
- `scripts/validate-tracking.js`: CLI entrypoint.
- `src/core`: Base provider + registry + request collector.
- `src/providers`: Provider implementations (start with Comscore).
- `src/crawler`: Site crawler.
- `src/validation`: Rule engine.
- `src/runner`: Orchestration logic.
- `src/persistence`: Repository abstraction, file repository, Mongo repository.
- `server/index.js`: Dashboard-ready backend API.

## Setup
=======
## Quick Start (Local)
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
## Persistence
In `config/base.config.js` (or `config/default.config.js`):
```js
persistence: {
    type: "mongo", // "file" or "mongo"
    uri: "mongodb://127.0.0.1:27017",
    dbName: "trackingValidator",
    batchSize: 50
}
```

## Run validator
```bash
npm run validate -- --site indianexpress
npm run validate -- --site financialexpress --env develop
npm run validate -- --all
```

Behavior:
- `type: "file"`: writes JSON/text report in `results/`.
- `type: "mongo"`: stores runs/pages/events/ruleResults in MongoDB.
- `--site <key>`: validates one site.
- `--all`: validates all configured sites sequentially.
- `--env <prod|develop|preprod|prelaunch>`: overrides environment start URL (defaults to `prod`).

Supported site keys are defined in `config/sites.js`.

## Runtime reliability settings
Configured in `config/base.config.js` under `runtime`:
- `settleMs`: initial post-navigation settle delay.
- `trackingWindowMs`: tracking capture window after `domcontentloaded` (default `7000` ms).
- `retryOnMissingProvider`: enable retry pass for missing per-page checks.
- `retryDelayMs`: delay between retries.
- `retryCount`: number of retries.

## Start dashboard backend API
```bash
npm run server
```

Server URL:
- `http://localhost:4000`

Endpoints:
- `GET /api/runs?site=<siteKey>&environment=<env>`
- `GET /api/runs/:id`
- `GET /api/runs/:id/pages`
- `GET /api/runs/:id/events`
- `GET /api/runs/:id/rules`
- `POST /api/build` (trigger non-blocking local validator run)

Build trigger payload:
```json
{
    "domain": "financialexpress",
    "environment": "develop"
}
```

Build response:
```json
{
    "status": "started"
}
```

## Provider model
Each provider extends `BaseProvider` and defines:
- `_key`
- `_pattern`
- `_name`
- `_type`
- optional `columnMapping`, `groups`, `keys`, `handleQueryParam`, `handleCustom`

## Add a provider
1. Add `src/providers/NewProvider.js` extending `BaseProvider`.
2. Register it in `src/providers/index.js`.
3. Include provider key in config `providers`.
4. Add rules under `rules`.

## Rule types
- `exists`: Provider fired at least `minCount` times in scope.
- `existsPerPage`: Provider fired at least `minCount` on each scoped page.
- `paramEquals`: At least one scoped event contains `paramKey=expected`.
- `accountAllowList`: observed account IDs must exactly match expected values.
- `exactlyOnePerPage`: provider event must fire exactly N times per page (supports param-scoped match, used for strict GA4 `page_view`).

## GA4 strict validation
- GA4 matching is host/path/param based and does not rely on optional query params.
- Required shape:
  - host: `analytics.google.com` (or `www.google-analytics.com`)
  - path includes: `/g/collect`
  - `tid` starts with `G-`
  - `en=page_view`
- Missing GA4 page_view fails.
- Duplicate GA4 page_view per page fails.

## Dashboard Architecture
- Homepage: `dashboard/app/page.tsx`
- Run detail page: `dashboard/app/runs/[id]/page.tsx`
- Rule results table: `dashboard/components/RuleStatusTable.tsx`
- Pages tab: `dashboard/components/PageTable.tsx`
- Events table: `dashboard/components/EventTable.tsx`
- Light/Dark theme logic: `dashboard/context/ThemeContext.tsx`
- Environment state: `dashboard/context/EnvironmentContext.tsx`
- Domain state: `dashboard/context/DomainContext.tsx`
- API service calls: `dashboard/services/api.ts` and `dashboard/services/serverApi.ts`
- Provider name mapping: `dashboard/utils/providerNames.ts`
- Shared dashboard styles: `dashboard/styles/globals.css`

### Extending the UI
- Add new filters in `dashboard/components/RunsDashboard.tsx`.
- Add new table/chart modules in `dashboard/components/`.
- Add new API calls in `dashboard/services/api.ts`.
- Add new provider labels in `dashboard/utils/providerNames.ts`.
- Add theme/layout utilities in `dashboard/styles/globals.css`.
=======
Then open:
- `http://<SERVER_IP>:3000`

See full deployment details in `DEPLOYMENT.md`.
>>>>>>> Stashed changes
