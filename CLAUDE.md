# CLAUDE.md

## Overview

A Stripe Hosted Checkout demo in two parts: a NestJS backend (`/backend`) that owns the item list and prices, creates Stripe Checkout Sessions and verifies webhooks, and a Next.js App Router frontend (`/frontend`) that lists items and redirects to Stripe's hosted payment page. Test mode only, no database.

## Folder layout

```
package.json  Root helper scripts only; forwards to backend/ and frontend/ via npm --prefix.
backend/    NestJS API: src/items.ts (catalogue), src/app.controller.ts (GET /items, POST /checkout, POST /webhook),
            src/app.service.ts (Stripe client), src/main.ts (rawBody + CORS). Task list in backend/TASKS.md.
frontend/   Next.js App Router: src/app/page.tsx (items + Buy), success/, cancel/, globals.css.
            Task list in frontend/TASKS.md.
```

## Running

From the repo root:

```bash
npm install                          # once, for the root helper only
npm run dev                          # backend :4000 and frontend :3000 together
npm run stripe                       # separate terminal: stripe listen --events checkout.session.completed --forward-to localhost:4000/webhook
```

Other root scripts: `dev:api`, `dev:web`, `build`, `lint`, `install:all`.

Each project still runs standalone if preferred:

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

Full setup instructions are in README.md.

## Rules

- Never read, print or create `.env` files. Only `.env.example` files are edited here. The user fills in real values.
- No comments in code.
- Keep the code minimal: no extra abstractions, no unused files, no UI libraries. The one
  deliberate exception is the root `package.json`, a convenience layer that only forwards to
  the two projects' own scripts with `npm --prefix` — put no real build logic in it.
- Prices live only in `backend/src/items.ts`. The frontend never sends a price and the backend never trusts one from the client.
- Update the status tags in `backend/TASKS.md` and `frontend/TASKS.md` while working: `[TODO]` → `[IN PROGRESS]` → `[DONE]`, and fill in the `Notes:` line honestly, including anything skipped or simplified.
- Never commit. Do not run git commands that change history.

## Notes for working in this repo

- The backend is ESM (`"type": "module"`), so relative imports need a `.js` extension, e.g. `import { AppService } from './app.service.js'`.
- The app is created with `NestFactory.create(AppModule, { rawBody: true })`. The webhook needs `request.rawBody`; do not remove that option or add a body parser that would replace it.
- Backend lint is oxlint, frontend lint is ESLint. Next 16's `react-hooks/immutability` rule rejects assigning to `window.location.href`; use `window.location.assign(url)`.

## Known limitations

- No database. Nothing is persisted.
- The webhook only logs the session id and amount on `checkout.session.completed`. It does not fulfil orders, and other event types are ignored.
- Test mode only.
- Quantity is fixed at 1 in the UI.
- No tests in either project.
