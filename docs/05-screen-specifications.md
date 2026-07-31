# De Big Tank — Screen Specifications

Status: Approved draft v0.2, reconciled with the implementation on 2026-07-31.

## Global experience

The public site uses a dark burgundy header, cream editorial surfaces, restrained gold highlights, serif headings and clear red actions. Desktop navigation is horizontal; mobile navigation opens beneath the header. The global cart is a right-side drawer and persists only on the visitor's device.

Cards are reserved for the three service gateways, menu items, promotion tiles and gallery tiles. About, Contact, Reservation and general editorial sections are unframed.

## Public screens

### Home

Order:

1. Full-width brand hero with Order and Reserve actions.
2. Exactly three prominent gateways: Restaurant, Bakery and Lounge.
3. Featured available menu items.
4. Unframed brand-story section.
5. Current promotion.
6. Gallery preview.
7. Reservation call to action.

On mobile, the gateway cards stack immediately after the hero.

### Restaurant, Bakery and Lounge

All three share a catalog pattern with service-specific copy, name search, category filters and product cards. Products show image, category, description, price and variants. A variant must be selected before adding where variants exist. Sold-out items remain visible but disabled.

### Gallery

A responsive image grid opens images in a full-screen lightbox. Every meaningful image has alternative text.

### Promotions

Only active promotions within their validity window appear publicly. Promotions use bounded image-and-copy tiles.

### About

An editorial story layout with supporting imagery and three unframed values.

### Contact

Business contact information, WhatsApp action, hours and map. When the approved map URL is absent, an honest location placeholder appears.

### Cart and checkout

The side drawer supports quantities, removal and per-item notes. Checkout requires name and a plausibly formatted phone number, supports Pickup or Delivery, shows a pickup-time field for Pickup and creates an itemized WhatsApp message. No API request is made.

### Reservation

An unframed form collects name, phone, optional email, future date, time, guests, area and notes. Submission creates a WhatsApp message. The page explains that staff confirmation is still required.

## Staff screens

`/admin` is not linked from the public site and is marked no-index.

- Login: email and password with generic failure messages.
- Overview: direct navigation to each content area; explicitly excludes order/reservation management.
- Categories: create, edit, visibility toggle and delete.
- Menu items: create, edit, variants, availability toggle and delete.
- Gallery: signed Cloudinary image upload, hosted-URL fallback, image creation/editing, visibility and deletion.
- Promotions: create, edit, schedule, pause and delete.
- Site settings: contact information, WhatsApp number, hours, social links, map and hero content.

All staff surfaces collapse to a single-column mobile layout.
