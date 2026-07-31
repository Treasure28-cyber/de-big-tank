# Progress

## 2026-07-28 - Phases 1-5: Scaffold and provisional implementation

### Built or changed
- Added an npm-workspace monorepo layout for a Next.js web app and NestJS API.
- Added a PostgreSQL/Prisma configuration placeholder.
- Added the supplied Overview, SRS, and DFD documents under `docs/` as source-of-truth documents.
- Added baseline repository documentation and environment examples.
- Installed Node.js LTS 24.18.0 and began dependency installation; package installation requires a final verification pass.
- Added a provisional Prisma content model, staff JWT login, guarded content-management endpoints, and public read endpoints.
- Added a provisional responsive public UI for all required public pages, a client-side cart, WhatsApp order handoff, and WhatsApp reservation handoff.
- Added three explicitly provisional documents: schema/SDD draft, API/DTO draft, and screen/layout draft.

### Deviations
- The project now uses provisional decisions to continue autonomously, as authorized by the project owner. These must be reviewed against the missing documents before production deployment.
- Placeholder menu content, WhatsApp number, contact details, address, hours, image URLs, and promotion copy were added only to make the public flow demonstrable. They are not business-approved content.
- Image upload is represented by externally hosted image URLs; Cloudinary integration is not yet configured because credentials and final upload-flow decisions are unavailable.

### Open questions / assumptions
- The SDD, DTO/API, and Screen Specifications remain missing. Their provisional replacements are `docs/04-pending-sdd-schema-draft.md`, `docs/06-pending-dto-api-specification.md`, and `docs/05-pending-screen-specifications.md`.
- A PostgreSQL instance, production JWT secret, first admin credentials, real WhatsApp phone number, Cloudinary credentials, business address, and deployment provider accounts are still required.
- Audit events are modeled but mutation logging is not yet wired to every controller action; this is a remaining NFR-10 item.

### Next
- Complete dependency verification and resolve compile errors.
- Add the initial admin seed process and full mutation audit logging.
- Configure a PostgreSQL database and run the first Prisma migration.
- Replace placeholder public content with CMS data and connect Cloudinary uploads.
- Add deployment configuration for Vercel and Railway/Render after accounts are confirmed.
