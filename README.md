# Bridgit Mock Platform

A self-contained mock non-profit dashboard built with Next.js, SQLite, and NextAuth. Used for testing and demonstrating Bridgit integrations without connecting to real third-party platforms.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
- **Auth**: NextAuth v5 with credentials provider (email/password, JWT sessions)
- **UI**: Tailwind CSS, Radix UI, shadcn/ui, Lucide icons
- **Runtime**: Node 22

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm

### Install & Run

```bash
pnpm install
pnpm dev
```

The app runs on [http://localhost:3003](http://localhost:3003) and redirects to the dashboard.

### Database

SQLite stores data in `data.db` at the project root. Manage the schema with Drizzle:

```bash
pnpm db:push       # Push schema changes to the database
pnpm db:seed       # Seed with sample data
pnpm db:generate   # Generate migration files
pnpm db:studio     # Open Drizzle Studio
```

## Project Structure

```
src/
  app/
    api/           # API routes (auth, config, profile, users)
    dashboard/     # Dashboard pages
      config/      # Platform configuration
      donations/   # Donations view
      donors/      # Donors view
      fundraising/ # Fundraising view
      profile/     # User profile
      users/       # User management (admin)
    login/         # Login page
  auth.ts          # NextAuth configuration
  db/              # Database connection, schema, seed
  components/      # Shared UI components
  hooks/           # Custom React hooks
  lib/             # Utilities
  types/           # TypeScript types
```

## Docker

```bash
docker build -t bridgit-mock-platform .
docker run -p 3003:3003 bridgit-mock-platform
```

The container auto-initializes the database and seeds it on first run via `entrypoint.sh`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `./data.db` | Path to the SQLite database file |
| `AUTH_SECRET` | — | NextAuth secret (required in production) |
