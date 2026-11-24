# De Big Tank — Project Overview

**Document 1 of 6 — Documentation Set**
Status: Draft v0.2 (revised — scope simplified to WhatsApp-based ordering/reservations)

---

## 1. Background

De Big Tank ("DBT") is a single brand operating three integrated hospitality service lines under one roof:

1. **Restaurant** — dine-in / à la carte food service
2. **Bakery** — baked goods, pastries, cakes (walk-in + order-ahead)
3. **Lounge** — drinks, relaxed seating, events/reservations

The website presents all three as one coherent brand, unified visually by the "BT" badge (chef's hat, fork, spoon).

## 2. Revised Scope Decision

After reviewing how the business actually operates, the scope has been deliberately simplified:

> **De Big Tank is a responsive business showcase website that lets customers browse the restaurant, bakery, and lounge offerings, build an order or reservation request, and send it to the business via WhatsApp for manual handling by staff. There is no customer account system, no online payment, and no in-system order tracking. Administrators manage website content (menu, gallery, promotions, business info) through a secured back-office.**

This is a much better fit than a full e-commerce build: De Big Tank doesn't need a checkout/payment/fulfillment engine — they need a fast, low-friction way for customers to arrive at a clear WhatsApp message, and a simple way for staff to keep the site's content current.

### Why this fits
- Staff already handle order confirmation and payment arrangements conversationally — the website's job is to *prepare* that conversation, not replace it
- Removes account creation, login, password reset, and email verification — all friction with no payoff for a business this size
- Removes the need for a payment gateway integration, PCI concerns, and order-status infrastructure
- Leaves a clean path to add real online ordering later without a redesign, if the business grows into needing it

## 3. Explicitly Removed From Scope (v1)

These were considered and intentionally dropped:

- ❌ Customer registration / login / profiles
- ❌ Online payment gateway
- ❌ In-system order tracking or status updates
- ❌ Saved order history
- ❌ Loyalty/points
- ❌ Delivery rider tracking
- ❌ Automated order-status notifications

All of the above are viable **v2 candidates** if the business later wants a full ordering platform — noted so nothing here is a permanent ceiling, just a deliberate v1 boundary.

## 4. What the Website Actually Does (v1)

**Public site:**
- Shows Restaurant menu, Bakery catalog, Lounge information
- Lets a customer browse, search/filter, and build a cart
- At checkout, collects just enough info (name, phone, order type: pickup/delivery, notes) to generate a pre-filled WhatsApp message — no payment, no account
- Same pattern for reservations: a short form (name, phone, date, time, guests, area/type, notes) generates a pre-filled WhatsApp reservation message
- Gallery, About, Promotions/Specials, Contact & location

**Admin/Staff back-office:**
- Secure login (staff only — not customer-facing)
- Manage menu items & categories (Restaurant, Bakery, Lounge/drinks), including availability toggling
- Manage gallery images
- Manage promotions/specials
- Manage contact info, business hours, WhatsApp number, social links, homepage banners
- *No* order or reservation management inside the system — those live entirely in WhatsApp once generated

## 5. Brand Foundation

| Element | Detail |
|---|---|
| Wordmark | "De Big Tank" — script "De" + bold serif "Big Tank" |
| Badge mark | Circular emblem: chef's hat, fork, spoon, "BT" monogram |
| Tagline | "Restaurant, Bakery & Lounge" |
| Primary | Deep Burgundy `#7A0D0D` |
| Secondary | Bright Red `#B31217` |
| Background | White `#FFFFFF` |
| Surface | Light Gray `#F5F5F5` |
| Accent (optional) | Gold `#C9A227`, for premium highlights on dark sections (consistent with the black/cream dark-variant logo) |
| Headings font | Playfair Display (or similar elegant serif) |
| Body font | Poppins or Inter |
| Visual style | Large food photography, rounded cards, soft shadows, clear CTAs for ordering/reserving |

## 6. User Roles

| Role | Description |
|---|---|
| **Customer/Guest** | Anyone browsing the site — no login required at any point |
| **Administrator** | Staff member managing site content via a secured dashboard |

No other roles at v1 (no kitchen view, no multi-branch, no owner-vs-staff split) — flagged as a v2 candidate if needed later.

## 7. Ordering & Reservation Model (core mechanic)

**Order flow:**
Browse Menu → Add to Cart → Review Cart → Enter Name & Phone + Order Type (Pickup/Delivery) + Notes → Generate WhatsApp Message → Customer taps to open WhatsApp → Customer sends → Business replies manually to confirm & arrange payment.

**Reservation flow:**
View Lounge/Restaurant info → Fill Reservation Form (name, phone, date, time, guests, area, notes) → Generate WhatsApp Reservation Message → Customer sends via WhatsApp → Business confirms manually.

The website's responsibility ends the moment the WhatsApp message is generated and handed off — everything after that (confirmation, payment, fulfillment) happens in the WhatsApp conversation, outside the system.

## 8. Target Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS
- **Backend:** Node.js (NestJS recommended for structure), TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Media/Images:** Cloudinary (or similar) for gallery/menu images
- **Hosting:** Vercel (frontend) + Railway/Render (backend) — flexible, to confirm based on budget
- No payment gateway needed for v1 (removed from scope)

## 9. Documentation Set (this deliverable)

| # | Document | Purpose |
|---|---|---|
| 1 | Project Overview *(this file)* | Context, revised scope, brand |
| 2 | Software Requirements Specification (SRS) | Functional & non-functional requirements |
| 3 | Data Flow Diagrams (DFD) | Context diagram, Level 1, Order flow, Reservation flow, Admin flow |
| 4 | Software Design Document (SDD) | Architecture, ERD/data model, tech decisions |
| 5 | Screen Specifications | Page/screen-by-screen UI spec |
| 6 | DTO / API Specifications | Request/response contracts (content management only — no order/payment APIs) |

Built in phases, as agreed.
