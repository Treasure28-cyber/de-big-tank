# Pending SDD Sign-off: Schema Draft

Status: Placeholder, not a settled Software Design Document.

This draft maps the content stores in the DFD into Prisma entities: `Admin`, `Category`, `Product`, `ProductVariant`, `GalleryImage`, `Promotion`, `SiteSettings`, and `AuditEvent`.

Key decisions requiring SDD confirmation:

- A product belongs to one category, which belongs to one service line.
- Product variants carry a relative `priceDelta` rather than an independent final price.
- `SiteSettings` is a singleton record with the id `default`; hours and social links are JSON to avoid prematurely formalizing their shape.
- Audit events capture the acting administrator and content mutation without storing customer data.
- There are intentionally no `Order`, `Reservation`, `Customer`, payment, or session tables.

The executable version of this draft is `apps/api/prisma/schema.prisma`.
