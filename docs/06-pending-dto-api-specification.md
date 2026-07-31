# Pending DTO/API Specification Sign-off: Contract Draft

Status: Placeholder, not a settled DTO/API specification.

All routes are prefixed by the API origin (local default: `http://localhost:3001`). Responses are Prisma records and error responses use NestJS's standard HTTP error envelope until formal response contracts are supplied.

## Public read routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/categories?line=RESTAURANT` | Active categories, optionally by service line |
| GET | `/products?line=BAKERY&q=cake` | Available products, categories and available variants |
| GET | `/gallery` | Active gallery images |
| GET | `/promotions` | Active promotions |
| GET | `/settings` | Public business settings, including WhatsApp number |

## Admin authentication

`POST /admin/auth/login` accepts `{ "email": string, "password": string }` and returns `{ "accessToken": string, "admin": { id, name, email, role } }`.

Admin content routes require `Authorization: Bearer <accessToken>`. There is intentionally no public registration endpoint.

## Admin content routes

| Resource | Routes |
|---|---|
| Categories | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/:id` |
| Products | `GET/POST /admin/products`, `PATCH/DELETE /admin/products/:id` |
| Gallery | `GET/POST /admin/gallery`, `PATCH/DELETE /admin/gallery/:id` |
| Promotions | `GET/POST /admin/promotions`, `PATCH/DELETE /admin/promotions/:id` |
| Settings | `PATCH /admin/settings` |

Draft payloads are represented by `CategoryDto`, `ProductDto`, `GalleryDto`, `PromotionDto`, and `SettingsDto` in `apps/api/src/content.controller.ts`. Product variants are nested in product write requests.

## Exclusions

There are no order, reservation, payment, customer registration, account, or order-status routes. Cart and WhatsApp composition are entirely browser-side.
