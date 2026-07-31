# De Big Tank — Software Requirements Specification (SRS)

**Document 2 of 6 — Documentation Set**
Status: Draft v0.2 (revised — WhatsApp-based ordering/reservations, no accounts/payments/tracking)
Related: [01-project-overview.md](01-project-overview.md)

---

## 1. Purpose

This document specifies the functional and non-functional requirements for the De Big Tank website: a public-facing showcase and ordering-assist site for its Restaurant, Bakery, and Lounge service lines, plus a content-management back-office for staff.

**Scope statement:** De Big Tank is a responsive business website that showcases the restaurant, bakery, and lounge services. Customers browse products, build a cart or reservation request, and the site generates a pre-filled WhatsApp message for manual handling by staff. There is no customer account system, no online payment, and no in-system order tracking. Administrators manage menus, gallery, promotions, and business information through a secured dashboard.

## 2. User Roles

| Role | Description |
|---|---|
| **Customer/Guest** | Any website visitor. No registration or login at any point. |
| **Administrator** | Staff member with a secured login, managing site content only. |

## 3. Functional Requirements

### 3.1 Menu & Catalog Browsing (FR-MENU)

| ID | Requirement |
|---|---|
| FR-MENU-1 | System shall display items grouped by service line: Restaurant, Bakery, Lounge (drinks) |
| FR-MENU-2 | System shall support categories within each line (e.g., Starters/Mains under Restaurant; Cakes/Bread/Pastries under Bakery) |
| FR-MENU-3 | Each item shall display name, description, price, image, and availability (in-stock/sold-out) |
| FR-MENU-4 | System shall support search and category filtering |
| FR-MENU-5 | Admin can mark an item unavailable without deleting it (hidden from ordering, still visible in admin) |
| FR-MENU-6 | System shall support item variants where relevant (e.g., cake size, drink size) with price differences |
| FR-MENU-7 | Bakery items may optionally support a free-text "special request" note per item (e.g., a cake customization note), captured in the cart, not a structured configurator |

### 3.2 Cart & WhatsApp Order Generation (FR-ORDER)

| ID | Requirement |
|---|---|
| FR-ORDER-1 | Customer shall be able to add items to a cart, adjust quantity, remove items, and add a note per item |
| FR-ORDER-2 | Customer shall choose Order Type: Pickup or Delivery |
| FR-ORDER-3 | Customer shall enter Name and Phone Number before generating an order message (no account required, no password) |
| FR-ORDER-4 | Customer shall be able to add general order notes (e.g., "no onions") and, for pickup, a preferred pickup time |
| FR-ORDER-5 | System shall compose a pre-filled, human-readable order message containing: customer name, phone, order type, itemized list with quantities, special instructions, and preferred time |
| FR-ORDER-6 | System shall generate a `wa.me` link with the message URL-encoded and open it (new tab / redirect) so the customer can review and press Send in WhatsApp themselves |
| FR-ORDER-7 | System shall NOT submit the order on the customer's behalf — the customer must actively send it from WhatsApp. The system's responsibility ends at message generation |
| FR-ORDER-8 | System shall NOT process payment, store payment details, or track order status after handoff |
| FR-ORDER-9 | Cart contents shall persist during the browsing session (e.g., local/session storage) so a page refresh doesn't lose the cart |

### 3.3 Reservations via WhatsApp (FR-RES)

| ID | Requirement |
|---|---|
| FR-RES-1 | Customer shall be able to fill a reservation form: Name, Phone, Email (optional), Date, Time, Number of Guests, Reservation Type/Area (e.g., Indoor/Lounge/VIP/Event), Special Request |
| FR-RES-2 | System shall generate a pre-filled WhatsApp reservation message from this form, structured similarly to the order message |
| FR-RES-3 | System shall provide the same `wa.me`-link handoff pattern as ordering — no in-system confirmation, approval, or reservation record required for v1 |
| FR-RES-4 | System shall NOT attempt to check table/lounge capacity or prevent double-booking — that judgment stays with staff in the WhatsApp conversation |

### 3.4 Admin/Staff Content Management (FR-ADMIN)

| ID | Requirement |
|---|---|
| FR-ADMIN-1 | Admin shall log in via a secured admin login, fully separate from the public site (no public registration path to this role) |
| FR-ADMIN-2 | Admin shall create, edit, delete, and toggle availability of menu items and categories across Restaurant, Bakery, and Lounge |
| FR-ADMIN-3 | Admin shall manage gallery images (upload/delete) |
| FR-ADMIN-4 | Admin shall manage promotions/specials (create/edit/expire) |
| FR-ADMIN-5 | Admin shall manage business info: WhatsApp order/reservation number, phone, email, address, business hours, social links |
| FR-ADMIN-6 | Admin shall manage homepage banners/hero content |
| FR-ADMIN-7 | System shall NOT provide order or reservation management screens — these are not stored/tracked in-system per the revised scope |

### 3.5 General/Content (FR-GEN)

| ID | Requirement |
|---|---|
| FR-GEN-1 | Website shall present Home, Restaurant, Bakery, Lounge, Gallery, About, Promotions, Contact pages |
| FR-GEN-2 | Website shall present the De Big Tank brand identity consistently (logo, colors, tone) across all pages |
| FR-GEN-3 | Website shall be usable on mobile, tablet, and desktop |
| FR-GEN-4 | Contact page shall include address, phone/WhatsApp, business hours, and an embedded map |
| FR-GEN-5 | Every "Order" and "Reserve" call-to-action shall funnel into the respective WhatsApp-generation flow described above |

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | Pages load within ~3 seconds under typical mobile network conditions |
| NFR-2 | Availability | Target 99.9% uptime for the public site |
| NFR-3 | Security | HTTPS everywhere; admin passwords hashed; JWT-based admin authentication; role authorization on admin routes; CSRF protection; basic rate limiting on admin login |
| NFR-4 | Scalability | Support 1,000+ concurrent visitors without degrading page load or cart/WhatsApp-handoff flows |
| NFR-5 | Usability | Cart-to-WhatsApp and reservation-to-WhatsApp flows completable in well under a minute, with minimal required fields |
| NFR-6 | Accessibility | Legible contrast against the burgundy/red/white palette, alt text on images, adequate tap-target sizes on mobile |
| NFR-7 | Maintainability | Modular REST API, clean separation between content-management modules (menu, gallery, promotions, settings) |
| NFR-8 | Reliability | Automatic backups of the content database; server-side error logging |
| NFR-9 | Localization | Currency displayed in Naira (₦); English-only content for v1 |
| NFR-10 | Auditability | Admin content changes (menu edits, availability toggles, promotion changes) should be timestamped and attributable to the acting admin account |
| NFR-11 | Browser support | Latest two versions of Chrome and Safari, plus in-app webviews (Instagram/WhatsApp/Facebook browser) since a lot of traffic will arrive via social links |
| NFR-12 | No PII retention beyond need | Since no accounts exist, the system should not persist customer name/phone/order details after the WhatsApp message is generated — that data lives in the WhatsApp conversation, not the database |

## 5. Features Explicitly Removed From Scope

Carried over from the scoping discussion, restated here for traceability:

- ❌ Customer registration / login / profile
- ❌ Password reset / email verification
- ❌ Online payment / payment gateway integration
- ❌ In-system order tracking or status
- ❌ Saved order history / customer dashboard
- ❌ Loyalty/points program
- ❌ Delivery rider tracking
- ❌ Order-status notifications (email/SMS/push)
- ❌ Reservation capacity/conflict checking

## 6. Assumptions & Open Questions

1. **Cart persistence** — session/local-storage only is assumed sufficient (no server-side cart record). Confirm this is acceptable.
2. **WhatsApp number** — single business WhatsApp number for both orders and reservations, managed by Admin in settings — confirm if orders and reservations should route to different numbers/departments.
3. **Delivery details** — the order form captures "Pickup or Delivery" as a type, but since there's no payment/tracking, delivery fee/logistics are handled entirely in the WhatsApp conversation, not calculated by the site. Confirm this matches expectations.
4. **Admin roles** — single Administrator role assumed sufficient for v1 (no Kitchen/Manager/Owner split).

## 7. Future Considerations (v2 candidates)

- Optional lightweight order/reservation logging (store a copy of what was sent, for the business's own records, without becoming a full tracking system)
- Real online payment + checkout, if the business scales past what manual WhatsApp handling can support
- Customer accounts, if repeat-order convenience becomes a priority
- Admin role-splitting (Kitchen vs Manager vs Owner)

---

*Next in sequence: Document 3 — Data Flow Diagrams (Context/Level 0, Level 1, Order flow, Reservation flow, Admin/content flow).*
