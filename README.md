# De Big Tank

Monorepo scaffold for the De Big Tank Restaurant, Bakery and Lounge website.

## Structure

- `apps/web` - Next.js public website and future admin UI
- `apps/api` - NestJS REST API
- `apps/api/prisma` - Prisma schema and PostgreSQL configuration
- `docs` - source project documentation

## Prerequisites

- Node.js 20.9 or later
- PostgreSQL 16 or later

## Local setup

1. Install dependencies with `npm install` from the repository root.
2. Copy `apps/api/.env.example` to `apps/api/.env` and set `DATABASE_URL`.
3. Run the web app with `npm run dev:web` and the API with `npm run dev:api`.

The product schema, CRUD contracts, and public page designs are intentionally not implemented in this scaffold. They require the missing SDD, DTO/API specification, and screen specifications respectively.
