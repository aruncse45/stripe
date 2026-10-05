# Frontend Tasks (Next.js App Router)

## 1. Scaffold the Next.js project
Status: [DONE]
Notes: Ran 'npx create-next-app@latest frontend --ts --app --eslint --no-tailwind --src-dir --import-alias "@/*" --use-npm --disable-git'. Verified in a throwaway directory first that --no-tailwind is accepted (it is not in --help but works) and that the command never prompts and never runs git. This ran before TASKS.md existed because the frontend/ folder had to exist first.

## 2. Remove unused Next.js boilerplate (default page content, default styles, generated docs, sample assets)
Status: [DONE]
Notes: Deleted src/app/page.module.css, src/app/favicon.ico, the five sample SVGs in public/ (which left public/ empty, so it was removed too), and the generated README.md. globals.css and page.tsx were rewritten in later tasks rather than deleted, and the placeholder comment was removed from next.config.ts. Honest exception: frontend/AGENTS.md and frontend/CLAUDE.md were deleted too but Next 16 rewrites them on every 'next build' or 'next dev', so they are back on disk and left in place. They are Next's own guidance for coding agents; the root CLAUDE.md is still the project one.

## 3. Create frontend/.env.example (NEXT_PUBLIC_API_URL)
Status: [DONE]
Notes: Created frontend/.env.example with NEXT_PUBLIC_API_URL=http://localhost:4000. NEXT_PUBLIC_ is required because the Buy button calls the backend from the browser. No real .env file was created or read.

## 4. Minimal global CSS and root layout
Status: [DONE]
Notes: Replaced globals.css with a short plain-CSS file (element selectors plus four small classes: price, error, note, code) and stripped layout.tsx down to a title, the globals import and a <main> wrapper. Dropped the Geist next/font imports the scaffold added so the app has no font downloads. No CSS modules and no UI library.

## 5. Home page "/": fetch GET /items, render name + formatted price + Buy button
Status: [DONE]
Notes: Home page is a client component that fetches GET ${NEXT_PUBLIC_API_URL}/items in useEffect and lists each item's name, price formatted with Intl.NumberFormat from the cents value and currency the backend sends, and a Buy button. Shows a loading line while fetching and an error line if the request fails. The Buy button has no behaviour yet - that is task 6.

## 6. Buy action: POST /checkout, redirect to returned url, loading state, error message
Status: [DONE]
Notes: Buy posts { itemId, quantity: 1 } to ${NEXT_PUBLIC_API_URL}/checkout and sends the browser to the returned url with window.location.assign(url) (task 9 changed this from an assignment to window.location.href to satisfy a lint rule). Quantity is fixed at 1 in the UI - the backend accepts any quantity >= 1, but there is no quantity picker. While a request is in flight that item's button reads 'Redirecting...' and every Buy button is disabled; a failure shows one plain error line and re-enables the buttons.

## 7. "/success" page: thank-you message, session_id from the URL, note that the webhook is the real confirmation
Status: [DONE]
Notes: /success is a server component that awaits searchParams and prints the session_id (or 'not provided' if it is missing), with a note saying the redirect is not proof of payment and that the checkout.session.completed webhook is the real confirmation. It does not call the backend to look the session up.

## 8. "/cancel" page: cancelled message and link back home
Status: [DONE]
Notes: /cancel is a static page saying nothing was charged, with a link back to the item list.

## 9. Verify the frontend builds and lints (npm run build, npm run lint)
Status: [DONE]
Notes: npm run build and npm run lint both pass. One real fix was needed: Next 16's react-hooks/immutability rule rejects 'window.location.href = url', so the redirect uses window.location.assign(url) instead. Build output is / and /cancel static and /success dynamic. Also ran both servers together and confirmed the home page and /cancel return 200, /success?session_id=cs_test_abc123 renders that id, and the backend only sends access-control-allow-origin for FRONTEND_URL. A real card payment was not run end to end because that needs live test keys, which I never had.

## 10. Write the root README.md
Status: [DONE]
Notes: Wrote /README.md: one-paragraph overview, folder tree, prerequisites (Node 20+, Stripe CLI), per-project setup with a table of which key goes in which .env, the three run commands, the stripe listen webhook section including where the whsec_ secret goes and that it changes per CLI session, the 4242 test card, the ten-step payment flow, and a short limitations list.

## 11. Write the root CLAUDE.md
Status: [DONE]
Notes: Wrote /CLAUDE.md: short overview, folder layout, the three run commands, the six rules (no .env reads, no code comments, minimal code, prices only on the backend, keep TASKS.md tags updated, never commit), three gotchas worth knowing (backend is ESM so imports need .js, do not remove rawBody, the window.location.assign lint rule), and the known limitations.
