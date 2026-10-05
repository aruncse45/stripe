# Stripe Hosted Checkout Demo

A small two-part demo of Stripe Hosted Checkout. A NestJS backend keeps a hardcoded list of three items and is the single source of truth for prices: it serves the catalogue, creates Stripe Checkout Sessions from its own stored prices, and verifies incoming Stripe webhooks. A Next.js frontend lists the items and sends the shopper to Stripe's hosted payment page, then handles the success and cancel redirects. The frontend never sees a Stripe key and never sends a price. This is a test-mode demo with no database.

## Folder structure

```
.
├── backend/            NestJS API (TypeScript)
│   ├── src/
│   │   ├── app.controller.ts   GET /items, POST /checkout, POST /webhook
│   │   ├── app.service.ts      Stripe client, session creation, webhook handling
│   │   ├── app.module.ts
│   │   ├── items.ts            hardcoded catalogue and prices
│   │   └── main.ts             rawBody, CORS, port
│   ├── .env.example
│   └── TASKS.md
├── frontend/           Next.js App Router (TypeScript)
│   ├── src/app/
│   │   ├── page.tsx            item list and Buy buttons
│   │   ├── success/page.tsx
│   │   ├── cancel/page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── .env.example
│   └── TASKS.md
├── .claude/settings.json
├── .claudeignore
├── .gitignore
├── CLAUDE.md
├── package.json        root helper scripts (forwards to both projects)
└── README.md
```

## Prerequisites

- Node.js 20 or newer (developed on Node 24.20.0) and npm
- A Stripe account in test mode
- The Stripe CLI, for forwarding webhooks to your machine: https://docs.stripe.com/stripe-cli

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Then fill in `backend/.env`:

| Variable | Value |
| --- | --- |
| `PORT` | `4000` |
| `STRIPE_SECRET_KEY` | Your test secret key, starts with `sk_test_`. Stripe Dashboard → Developers → API keys. |
| `STRIPE_WEBHOOK_SECRET` | Starts with `whsec_`. Printed by `stripe listen` — see the webhook section below. |
| `FRONTEND_URL` | `http://localhost:3000` |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Then fill in `frontend/.env`:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` |

No Stripe key goes in the frontend. The only secret keys live in `backend/.env`.

## Running

From the repo root, install the root helper once:

```bash
npm install
```

Terminal 1 — both servers together:

```bash
npm run dev
```

Output is labelled `[api]` (backend, port 4000) and `[web]` (frontend, port 3000), and one
Ctrl+C stops both.

Terminal 2 — webhook forwarding (see below):

```bash
npm run stripe
```

Then open http://localhost:3000.

### Root scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Both servers together |
| `npm run dev:api` | Backend only, port 4000 |
| `npm run dev:web` | Frontend only, port 3000 |
| `npm run stripe` | `stripe listen --events checkout.session.completed --forward-to localhost:4000/webhook` |
| `npm run build` | Builds backend, then frontend |
| `npm run lint` | Lints backend, then frontend |
| `npm run install:all` | `npm install` in both projects |

These only forward to each project's own scripts, so either project still runs standalone:

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

## Testing webhooks locally

Stripe cannot reach `localhost`, so the Stripe CLI forwards events to you.

1. Log in once: `stripe login`
2. Start forwarding:

   ```bash
   stripe listen --events checkout.session.completed --forward-to localhost:4000/webhook
   ```

   `--events` is required on Stripe CLI 1.53 and newer — it no longer forwards everything by
   default, and without it you get `must specify events to forward using --events,
   --all-snapshot, or --all-thin`. This project only handles `checkout.session.completed`.
   Use `--all-snapshot` instead if you ever want every classic event.

3. The CLI prints a line like:

   ```
   Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxx
   ```

4. Copy that `whsec_...` value into `STRIPE_WEBHOOK_SECRET` in `backend/.env` and **restart the
   backend**. The restart is not optional: `nest start --watch` watches TypeScript files, not
   `.env`, so `ConfigModule` keeps whatever value it read at startup.

This secret is specific to the `stripe listen` session, so it can change when you restart the CLI. If signature verification starts failing with a 400, copy the new secret again.

With forwarding running, a completed payment makes the backend log a line like:

```
[AppService] checkout.session.completed id=cs_test_... amount_total=1200 currency=usd
```

## Test card

| Field | Value |
| --- | --- |
| Number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any value |

More test cards: https://docs.stripe.com/testing

## The payment flow

1. The browser loads `http://localhost:3000`, which calls `GET /items` on the backend.
2. The backend returns the three hardcoded items with prices in cents.
3. The shopper clicks **Buy**, and the frontend sends `POST /checkout` with `{ itemId, quantity: 1 }` — no price.
4. The backend looks the item up in its own list, rejects an unknown `itemId` or a quantity below 1 with a 400, and otherwise creates a Stripe Checkout Session in `payment` mode using its own stored price.
5. The backend returns `{ url }`, the Stripe-hosted Checkout page for that session.
6. The frontend redirects the browser to that URL. Card details are entered on Stripe's domain and never touch either app.
7. On payment, Stripe redirects to `http://localhost:3000/success?session_id=cs_test_...`, which shows the session id. If the shopper backs out, Stripe redirects to `http://localhost:3000/cancel` and nothing is charged.
8. Separately, Stripe sends a `checkout.session.completed` event to `POST /webhook`, forwarded by the Stripe CLI.
9. The backend verifies the signature against the raw request body using `STRIPE_WEBHOOK_SECRET`, returning 400 if it does not match.
10. On a verified `checkout.session.completed`, the backend logs the session id and amount. That log line is the authoritative confirmation — the success page only means the browser was redirected back.

## Known limitations

- No database. Nothing about an order is stored; the webhook only writes a log line.
- Test mode only.
- Quantity is fixed at 1 in the UI, though the API accepts any whole number of 1 or more.
- No tests.
