# Zenith Finance

A personal finance & net worth tracking dashboard — multi-currency (USD/LKR), cash-flow
visualization, sinking funds, BNPL/installment tracking, and a what-if forecasting simulator.

**Stack:** Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · shadcn/ui ·
Prisma ORM · Supabase Postgres · Auth.js v5 (NextAuth) · Recharts · Framer Motion.

## 1. Local setup

```bash
npm install
```

Copy the env template and fill in real values (see section 2):

```bash
cp .env.example .env
```

Apply the schema and seed demo data:

```bash
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run dev
```

Visit `http://localhost:3000`. Sign in with the seeded demo account:
`demo@zenithfinance.app` / `password123` — or register a new account.

### Testing without Supabase

To try the app without setting up Supabase first, Prisma can run a local throwaway
Postgres server:

```bash
npx prisma dev          # prints a local postgres:// URL — put it in .env as
                         # both DATABASE_URL and DIRECT_URL
npm run db:migrate
npm run db:seed
```

## 2. Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Supabase **pooled** connection string (port 6543). Must include `?pgbouncer=true` — Supabase's pooler runs in transaction mode, which doesn't support prepared statements, and Prisma will throw `prepared statement "s0" already exists` (42P05) without this flag. |
| `DIRECT_URL` | Supabase **direct** connection string (port 5432). Used by `prisma migrate` / `prisma db seed`, which need a non-pooled connection. |
| `NEXTAUTH_SECRET` | Session encryption secret. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Base URL of the deployment (`http://localhost:3000` locally). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional — enables "Sign in with Google". Leave blank to disable. |
| `NEXT_PUBLIC_USD_LKR_RATE` | Display-only USD→LKR spot rate used by the currency toggle. |

Get the Supabase connection strings from **Project Settings → Database → Connection string**
(select "Connection pooling" for `DATABASE_URL`, "Direct connection" for `DIRECT_URL`).

## 3. Deploying to Vercel

1. Push this repo to GitHub.
2. Create a free [Supabase](https://supabase.com) project, then copy its connection strings
   into the env vars above.
3. In Vercel: **New Project → Import** the GitHub repo.
4. Add all the environment variables from `.env.example` in the Vercel project's
   **Settings → Environment Variables**.
5. Deploy. `npm run build` runs `prisma generate` automatically via the `postinstall` script.
6. After the first deploy, run the migration against production once (locally, pointed at
   the production `DIRECT_URL`, or via Vercel's CLI/shell):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed   # optional — seeds a demo account
   ```

Google OAuth (optional): create an OAuth 2.0 Client ID in the
[Google Cloud Console](https://console.cloud.google.com/apis/credentials) with an authorized
redirect URI of `https://<your-domain>/api/auth/callback/google`.

## 4. Project structure

- `prisma/schema.prisma` — data model (User, FinancialAccount, Transaction, SinkingFund,
  DebtTracker) plus the Auth.js adapter models.
- `src/auth.ts` / `src/auth.config.ts` — Auth.js v5 config, split so the Edge-safe
  `authorized` callback can run in `src/proxy.ts` (Next.js's route-protection layer)
  without pulling in Prisma's Node engine.
- `src/lib/finance.ts` — server-side aggregation of KPIs, cash-flow categories, and the
  emergency-fund progress shown on the dashboard.
- `src/app/(dashboard)/dashboard/*` — Overview, Expenses, Sinking Funds, and Analytics pages.
- `src/app/actions/*` — Server Actions for creating/updating transactions, sinking funds,
  and debt trackers.
