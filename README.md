# Splittr

A clean expense splitting app for groups. No accounts needed -- create a group, add friends, and track who owes what.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to the SQL Editor and run the contents of `supabase/migrations/001_initial_schema.sql`

### 2. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key (found in Settings > API).

### 3. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Create groups and add members by name
- Add expenses with equal or percentage-based splits
- View per-person balances with visual indicators
- Smart debt simplification (minimizes number of payments needed to settle up)
- Shareable group links

## Tech Stack

- Next.js 15 (App Router)
- Supabase (Postgres)
- Tailwind CSS v4
- TypeScript
