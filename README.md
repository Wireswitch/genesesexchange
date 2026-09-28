# Geneses Capital Exchange — MVP web app

Next.js (App Router) + TypeScript + Tailwind + Prisma/Postgres + NextAuth + Claude API.

## What's included
- Public site: Home, About, Seek Capital, Capital Providers, Services, Sectors, Insights, Contact
- Auth with roles: project owner, capital provider, admin/analyst/compliance
- Project portal: guided application, document upload, missing-document checklist, status, released assessment
- Capital provider portal: investment mandate, matched opportunities (released matches only)
- Admin: dashboard (pipeline, sector/country, revenue vs $1M target), project review, match review queue, providers
- Claude-powered: Capital Readiness scoring, match rationale, executive-summary drafting
- Human review gate: AI outputs are stored as PENDING_REVIEW and are invisible to applicants/providers until staff release them
- Audit log of key actions

## Not included yet (needs real integrations)
- Payments (Stripe or a mobile-money gateway) — revenue is recorded manually in the admin dashboard
- KYC/AML/sanctions provider — `kycStatus` is a field only; nothing verifies anyone yet
- NDA/e-signature and tiered data-room permissions — documents are uploaded but there is no provider-facing data room
- Email notifications, MFA, secure messaging UI (schema exists)
- **Document storage is public-URL Vercel Blob.** Do not upload real client documents until you move to private storage with signed, expiring access.

## Local setup
1. `npm install`
2. Create a free Postgres database (Neon or Vercel Postgres) and copy `.env.example` to `.env`, filling in every value.
3. Create tables: `npx prisma db push`  (or `npx prisma migrate dev --name init` to keep migration history)
4. Create the admin user: `npm run db:seed`
5. `npm run dev` → http://localhost:3000, log in with the seed admin credentials.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. In Vercel: New Project → import the repo.
3. Add environment variables (Settings → Environment Variables): `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` (your Vercel URL), `ANTHROPIC_API_KEY`, `BLOB_READ_WRITE_TOKEN`. Optional: `ANTHROPIC_MODEL`.
4. Storage tab → create a Blob store to get `BLOB_READ_WRITE_TOKEN`.
5. Before the first deploy (or from your machine pointed at the production DB): `npx prisma db push` then `npm run db:seed`.
6. Deploy. Change the seed admin password immediately.

## Notes
- Default AI model is `claude-sonnet-5`; override with `ANTHROPIC_MODEL`.
- Matching filters on objective factors (geography, sector, ticket, instrument, currency, tenor), keeps fits of 50+, then asks Claude for a short rationale.
- Before enabling regulated activity in any jurisdiction, get legal advice on licensing. The app never holds client funds.
