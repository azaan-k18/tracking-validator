# Tracking Validator

Config-driven tracking QA using Playwright and ES6 JavaScript.

## What it does
- Crawls a site with breadth-first traversal.
- Captures network requests for configured providers.
- Parses provider parameters into normalized fields.
- Runs validation rules in the same execution run.
- Writes JSON + text reports for QA and future dashboard ingestion.

## Stack
- Node.js 20+
- Playwright
- ESLint

## Project structure
- `config/default.config.js`: Crawl/runtime/providers/rules.
- `scripts/validate-tracking.js`: CLI entrypoint.
- `src/core`: Base provider + registry + request collector.
- `src/providers`: Provider implementations (start with Comscore).
- `src/crawler`: Site crawler.
- `src/validation`: Rule engine.
- `src/runner`: Orchestration logic.
- `src/reporting`: Report writers.

## Setup
```bash
npm install
```

## Run
```bash
npm run validate -- --config config/default.config.js
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

## Notes for production
- Keep rules in version control.
- Add CI step to run validator against staging.
- Push report JSON into a datastore for dashboarding.
