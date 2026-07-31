# De Big Tank

Responsive public website and staff content-management workspace for De Big Tank Restaurant, Bakery and Lounge.

Visitors can browse all three menus, build a device-local cart and prepare order or reservation messages for WhatsApp. The application does not store customer details, orders or reservations and does not process payment.

## Applications

- `apps/web` — Next.js public website and `/admin` staff workspace.
- `apps/api` — NestJS content API and JWT-based staff authentication.
- `apps/api/prisma` — PostgreSQL schema, initial migration and administrator seed.
- `docs` — approved product, requirements, architecture, screen and API documentation.

## Requirements

- Node.js 20.9 or later
- PostgreSQL 16 or later

## Local setup

1. Install locked dependencies with `npm install`.
2. Copy `apps/api/.env.example` to `apps/api/.env` and replace every placeholder.
3. Copy `apps/web/.env.example` to `apps/web/.env.local` if the local URLs differ.
4. Apply the database migration with `npm run prisma:migrate --workspace=@de-big-tank/api`.
5. Create the first administrator with `npm run seed:admin --workspace=@de-big-tank/api`.
6. Start the API with `npm run dev:api`.
7. Start the website with `npm run dev:web`.

The public website runs at `http://localhost:3000`, the API at `http://localhost:3001`, and the unlinked staff workspace at `http://localhost:3000/admin`.

## Verification

- `npm run build`
- `npm run lint`
- `npm audit`

## Required production configuration

- PostgreSQL connection string and automated backups
- A long random JWT secret
- First administrator credentials
- Real WhatsApp number, contact details, address, hours and social links
- Approved logo, final photography and business copy
- Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) for staff image uploads
- HTTPS frontend/API origins in `WEB_ORIGIN` and `NEXT_PUBLIC_API_URL`

Never commit `.env` files or production credentials.

## Deployment templates

- `render.yaml` provisions the NestJS API and PostgreSQL database on Render, applies migrations at startup and exposes `/health` for health checks.
- `apps/web/vercel.json` configures the Next.js workspace for Vercel.

Set `WEB_ORIGIN` to the final frontend origin and `NEXT_PUBLIC_API_URL` to the final API origin before building production. Deployment is not complete until the real environment values, first administrator and business content are configured.
