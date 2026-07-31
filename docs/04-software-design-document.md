# De Big Tank — Software Design Document

Status: Approved draft v0.2, reconciled with the implementation on 2026-07-31.

## Architecture

The repository is an npm-workspace monorepo:

- `apps/web`: Next.js 16.2, React 19.2, TypeScript and Tailwind CSS.
- `apps/api`: NestJS 11 REST API.
- PostgreSQL is accessed only through Prisma.
- Public ordering and reservations are composed in the browser and handed to `wa.me`. No customer, cart, order, reservation or payment data is sent to the API.
- Staff authenticate against the API with a short-lived JWT. Protected mutations are attributed to the acting administrator.
- Product and gallery images are URL-backed until Cloudinary credentials are supplied.

## Data model

```mermaid
erDiagram
  ADMIN ||--o{ AUDIT_EVENT : performs
  CATEGORY ||--o{ PRODUCT : contains
  PRODUCT ||--o{ PRODUCT_VARIANT : offers

  ADMIN {
    string id PK
    string name
    string email UK
    string passwordHash
    enum role
    boolean isActive
    datetime createdAt
    datetime updatedAt
  }
  CATEGORY {
    string id PK
    string name
    string slug UK
    enum serviceLine
    string description
    int sortOrder
    boolean isActive
  }
  PRODUCT {
    string id PK
    string categoryId FK
    string name
    string slug UK
    string description
    decimal price
    string imageUrl
    string altText
    boolean isAvailable
    boolean allowsSpecialNotes
  }
  PRODUCT_VARIANT {
    string id PK
    string productId FK
    string name
    decimal priceDelta
    boolean isAvailable
    int sortOrder
  }
  GALLERY_IMAGE {
    string id PK
    string imageUrl
    string altText
    string caption
    int sortOrder
    boolean isActive
  }
  PROMOTION {
    string id PK
    string title
    string slug UK
    string description
    string imageUrl
    datetime startsAt
    datetime endsAt
    boolean isActive
  }
  SITE_SETTINGS {
    string id PK
    string whatsappNumber
    string phone
    string email
    string address
    json businessHours
    json socialLinks
    string heroTitle
    string heroSubtitle
    string heroImageUrl
  }
  AUDIT_EVENT {
    string id PK
    string actorId FK
    string action
    string entityType
    string entityId
    json metadata
    datetime createdAt
  }
```

Money is stored as PostgreSQL `Decimal(12,2)` in Naira. A product has one category, and the category determines its Restaurant, Bakery or Lounge service line. Variants apply a relative `priceDelta`.

`SiteSettings` is a singleton with the id `default`. Business hours and social links remain JSON because their business-owned shapes can evolve without unnecessary relational tables.

Category deletion is blocked while products reference it. Product deletion cascades to variants. Routine sold-out handling uses `isAvailable`, not deletion.

## Security

- Passwords are hashed with bcrypt at cost 12.
- There is no public registration endpoint.
- A production-strength `JWT_SECRET` is mandatory at API startup.
- Login is rate-limited to five attempts per minute.
- The JWT guard rechecks that the administrator exists, is active and has the `ADMIN` role.
- API request bodies are whitelisted; unknown fields are rejected.
- All admin content mutations create an `AuditEvent`.
- Bearer tokens are held in staff browser session storage. Because authentication is not cookie-based, cross-site form requests cannot carry staff credentials automatically.
- Customer details remain in browser form state and the generated WhatsApp URL only.

## Deployment

The frontend and API deploy independently. Required production inputs are documented in the environment examples. PostgreSQL backups, HTTPS and runtime logging are deployment-provider responsibilities and must be enabled before launch.
