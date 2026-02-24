# Tracking Validator

Config-driven tracking QA using Playwright and ES6 JavaScript.

## What it does
- Crawls a site with breadth-first traversal.
- Captures network requests for configured providers.
- Parses provider parameters into normalized fields.
- Runs validation rules in the same execution run.
- Persists run data to files or MongoDB.
- Exposes dashboard-ready run APIs via Express.

## Stack
- Node.js 20+
- Playwright
- MongoDB (native driver)
- Express + CORS
- ESLint

## Project structure
- `config/default.config.js`: Crawl/runtime/providers/rules/persistence.
- `scripts/validate-tracking.js`: CLI entrypoint.
- `src/core`: Base provider + registry + request collector.
- `src/providers`: Provider implementations (start with Comscore).
- `src/crawler`: Site crawler.
- `src/validation`: Rule engine.
- `src/runner`: Orchestration logic.
- `src/persistence`: Repository abstraction, file repository, Mongo repository.
- `server/index.js`: Dashboard-ready backend API.

## Setup
```bash
npm install
```

## MongoDB setup
MongoDB local URI default:
- `mongodb://127.0.0.1:27017`

Default database name:
- `trackingValidator`

Run MongoDB locally (Homebrew install expected):
```bash
brew services start mongodb-community
```

## Switch persistence type
In `config/default.config.js`:
```js
persistence: {
    type: "file", // "file" or "mongo"
    uri: "mongodb://127.0.0.1:27017",
    dbName: "trackingValidator",
    batchSize: 50
}
```

## Run validator
```bash
npm run validate -- --config config/default.config.js
```

Behavior:
- `type: "file"`: writes JSON/text report in `results/`.
- `type: "mongo"`: stores runs/pages/events/ruleResults in MongoDB.

## Start dashboard backend API
```bash
npm run server
```

Server URL:
- `http://localhost:4000`

Endpoints:
- `GET /api/runs`
- `GET /api/runs/:id`
- `GET /api/runs/:id/pages`
- `GET /api/runs/:id/events`
- `GET /api/runs/:id/rules`

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

## Dashboard Architecture
- Homepage: `dashboard/app/page.tsx`
- Run detail page: `dashboard/app/runs/[id]/page.tsx`
- Rule results table: `dashboard/components/RuleStatusTable.tsx`
- Pages tab: `dashboard/components/PageTable.tsx`
- Light/Dark theme logic: `dashboard/components/theme/ThemeProvider.tsx` and `dashboard/components/ThemeToggle.tsx`
- API service calls: `dashboard/services/api.ts`
- Provider name mapping: `dashboard/utils/providerNames.ts`
- Shared dashboard styles: `dashboard/styles/globals.css`

### Extending the UI
- Add new filters in `dashboard/components/RunsDashboard.tsx`.
- Add new table/chart modules in `dashboard/components/`.
- Add new API calls in `dashboard/services/api.ts`.
- Add new provider labels in `dashboard/utils/providerNames.ts`.
- Add theme/layout utilities in `dashboard/styles/globals.css`.
