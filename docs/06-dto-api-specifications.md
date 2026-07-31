# De Big Tank — DTO and API Specification

Status: Approved draft v0.2, reconciled with the implementation on 2026-07-31.

Base URL in development: `http://localhost:3001`.

Errors use NestJS's JSON error envelope. Unknown request fields are rejected. Admin routes require `Authorization: Bearer <accessToken>`.

## Public routes

| Method | Route | Behavior |
|---|---|---|
| GET | `/health` | Returns `{ "status": "ok" }` |
| GET | `/categories?line=RESTAURANT` | Returns active categories, optionally by service line |
| GET | `/products?line=BAKERY&q=cake&category=cakes` | Returns products in active categories, including sold-out status and variants |
| GET | `/gallery` | Returns active images ordered by display order |
| GET | `/promotions` | Returns active promotions whose optional date window includes the current time |
| GET | `/settings` | Returns the public-safe site-settings projection |

`line` is `RESTAURANT`, `BAKERY` or `LOUNGE`.

## Authentication

`POST /admin/auth/login`

Request:

```json
{ "email": "admin@example.com", "password": "minimum-eight-characters" }
```

Success:

```json
{
  "accessToken": "jwt",
  "admin": { "id": "id", "name": "Name", "email": "admin@example.com", "role": "ADMIN" }
}
```

There is no registration, reset or customer-authentication route.

## Admin resources

| Resource | Routes |
|---|---|
| Categories | `GET/POST /admin/categories`, `PATCH/DELETE /admin/categories/:id` |
| Products | `GET/POST /admin/products`, `PATCH/DELETE /admin/products/:id` |
| Gallery | `GET/POST /admin/gallery`, `PATCH/DELETE /admin/gallery/:id` |
| Promotions | `GET/POST /admin/promotions`, `PATCH/DELETE /admin/promotions/:id` |
| Settings | `PATCH /admin/settings` |
| Media | `POST /admin/media/upload` multipart field `file` (JPEG, PNG, WebP or AVIF, maximum 10 MB) |

### Category fields

`name`, `slug`, `serviceLine`, optional `description`, `sortOrder`, `isActive`.

### Product fields

`name`, `slug`, `description`, decimal `price`, `categoryId`, optional `imageUrl`, `altText`, `isAvailable`, `allowsSpecialNotes`, and `variants`.

A variant contains `name`, decimal `priceDelta`, optional `isAvailable` and `sortOrder`. Supplying variants in a product PATCH replaces the complete variant set.

### Gallery fields

`imageUrl`, `altText`, optional `caption`, `sortOrder`, `isActive`.

### Promotion fields

`title`, `slug`, `description`, optional `imageUrl`, ISO `startsAt`, ISO `endsAt`, `isActive`. When both dates exist, `endsAt` must be later than `startsAt`.

### Settings fields

Optional fields: `businessName`, `tagline`, digit-only `whatsappNumber`, `phone`, `email`, `address`, `mapEmbedUrl`, object-valued `businessHours`, object-valued `socialLinks`, `heroTitle`, `heroSubtitle`, `heroImageUrl`, `heroImageAlt`.

`whatsappNumber` is required when the singleton is created.

## Explicit exclusions

No order, reservation, payment, customer, cart or order-status routes exist. The API never receives customer name, phone, cart or reservation details.
