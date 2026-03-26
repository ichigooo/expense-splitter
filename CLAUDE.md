@AGENTS.md

# Splittr — Expense Splitter App

## Tech Stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (Postgres)
- Deployed on Vercel at `trainichi.app/splittr` (via rewrite from trainichi-web)
- `basePath: "/splittr"` in next.config.ts

## Deployment

```bash
# 1. Build and verify
npm run build

# 2. Deploy to Vercel production
vercel --prod
```

The app is served at `trainichi.app/splittr` via a rewrite in the trainichi-web project (`/Users/linnawang/dev/trainichi-web/next.config.js`). No additional steps needed after `vercel --prod` — the rewrite points to the stable Vercel domain `expense-splitter-omega.vercel.app`.

## Supabase Migrations

Run new migration SQL in the Supabase SQL Editor at the project dashboard. Migration files are in `supabase/migrations/`.

## Key Directories
- `app/` — Pages and server actions
- `components/` — Client/server UI components
- `lib/` — Supabase client, types, split calculator
- `supabase/migrations/` — SQL migration files
