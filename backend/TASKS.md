# Backend Tasks (NestJS)

## 1. Scaffold the NestJS project
Status: [DONE]
Notes: Ran 'npx @nestjs/cli new backend --package-manager npm --skip-git --no-observe'. Added --no-observe because the current Nest CLI otherwise asks an interactive question about observability; all other flags were as requested. No git repo was created. This ran before TASKS.md existed because the backend/ folder had to exist first.

## 2. Create repo-level safety and ignore files (.gitignore, .claudeignore, .claude/settings.json)
Status: [DONE]
Notes: Created /.claudeignore (.env, .env.*, **/.env, **/.env.* with negations so .env.example stays visible), /.claude/settings.json with the four Read deny rules, and /.gitignore covering env files, node_modules, dist and .next. The frontend scaffold also brought its own frontend/.gitignore, which was left in place.

## 3. Remove unused NestJS boilerplate (app.controller, app.service, sample tests)
Status: [DONE]
Notes: Deleted src/app.controller.ts, src/app.service.ts, src/app.controller.spec.ts, the test/ e2e folder, both vitest configs and the scaffold README. Also dropped the now-unused test and deploy scripts plus their devDependencies (vitest, supertest, @nestjs/testing, @vitest/coverage-v8, vite-tsconfig-paths, @nestjs/mau) and pointed lint/format at src/ only. This means the backend ships with no test setup at all - that was a deliberate simplification, not an oversight.

## 4. Install dependencies (@nestjs/config, stripe)
Status: [DONE]
Notes: Installed @nestjs/config ^12.0.1 and stripe ^23.0.0 with npm. The same install also pruned the 140 test packages removed in task 3.

## 5. Create backend/.env.example (PORT, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, FRONTEND_URL)
Status: [DONE]
Notes: Created backend/.env.example with PORT=4000, empty STRIPE_SECRET_KEY, empty STRIPE_WEBHOOK_SECRET and FRONTEND_URL=http://localhost:3000. No real .env file was created or read.

## 6. Configure main.ts (NestFactory.create with rawBody, CORS for FRONTEND_URL, listen on PORT)
Status: [DONE]
Notes: main.ts now calls NestFactory.create(AppModule, { rawBody: true }) so the webhook can read the unparsed body, enables CORS for the single FRONTEND_URL origin, and listens on PORT (falling back to 4000). Values are read through ConfigService.

## 7. Configure AppModule with ConfigModule
Status: [DONE]
Notes: AppModule imports ConfigModule.forRoot({ isGlobal: true }) so ConfigService is available everywhere without re-importing, and registers the single AppController and AppService that the next tasks fill in.

## 8. Hardcoded items list and GET /items endpoint
Status: [DONE]
Notes: Added src/items.ts with three hardcoded items (mug 1200, tshirt 2500, hoodie 5900, all usd, prices in cents) plus a findItem helper, and wired GET /items through AppController -> AppService. The list is plain in-memory data and is the only place prices are defined.

## 9. POST /checkout: server-side price lookup, Stripe Checkout Session, input validation (400 on bad itemId or quantity < 1)
Status: [DONE]
Notes: POST /checkout takes { itemId, quantity }, looks the item up in the backend list and builds the Stripe line item from the stored price - the request body price is never trusted because the client never sends one. Unknown itemId and a quantity that is not a whole number >= 1 both return 400 (a missing quantity fails the same check). success_url and cancel_url are built from FRONTEND_URL. Used inline price_data rather than pre-created Stripe Price objects to keep the demo self-contained. The handler returns { url }; a session without a url returns 500.

## 10. POST /webhook: verify signature with raw body, handle checkout.session.completed by logging session id and amount
Status: [DONE]
Notes: POST /webhook reads request.rawBody (available because of rawBody: true in main.ts) and the stripe-signature header, verifies them with stripe.webhooks.constructEvent and STRIPE_WEBHOOK_SECRET, and returns 400 if the header/body is missing or the signature does not verify. On checkout.session.completed it only writes a Nest log line with the session id, amount_total and currency. There is no database and nothing is persisted or fulfilled - the log line is the entire handler. Other event types are accepted and ignored.

## 11. Verify the backend compiles (npm run build)
Status: [DONE]
Notes: npm run build passed after removing a leftover 'vitest/globals' entry from tsconfig types that task 3 had orphaned. Also booted the compiled server on port 4123 with placeholder env values passed inline (no .env file written) and confirmed: GET /items returns the three items, POST /checkout returns 400 for an unknown itemId and for quantity 0, and POST /webhook returns 400 on a bad signature - which also proves the raw body reaches Stripe's verifier. A real Stripe key was never used, so a successful Checkout Session was not created in this test. oxlint passed and prettier was run over src/.
