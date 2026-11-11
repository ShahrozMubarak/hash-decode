# Delivery scope

This is a coherent foundation release. It does not claim completion of the full premium CMS/portal brief.

| Area | Status | Delivered and next step |
| --- | --- | --- |
| MongoDB persistence | Done | One cached client, environment checks, canonical readers/writers; no live D1/SQLite/default overlay. Next: back up/migrate your Preview DB and create indexes. |
| Contact/newsletter | Done in code | Strict validation, 20 KB body limit, honeypot/timing/link checks, durable limits, idempotent inquiries and unique subscriptions. Next: Preview acceptance. |
| Email | Done in code; account verification pending | Save-first awaited Resend call, persisted statuses, retry/test buttons and security notices. Next: verify DNS/sender and inbox delivery. |
| Owner security | Done in code | Singleton CLI account, scrypt, mandatory encrypted TOTP, replay prevention, recovery codes, IP/account lockout, cookie-only revocable sessions, CSRF, reauth and audit. Next: Preview login/reset/recovery tests. |
| Headers/CSP | Partial | Nonce report-only policy and bounded/rate-limited report endpoint. Detailed violation URLs are not logged. Next: tune actual CSP on Vercel before enforcement. |
| Operations | Partial | Explicit insert-only migration and EJSON backup. Next: isolated restore rehearsal and encrypted recurring backups. |
| Layout | Partial | Shared tokens, small labels/large headings, spacing, mobile hero/marquee, visible-content fallback, initials, fixed project/sample filters. Visual browser launch was blocked; next: 390px/1440px review. Full legacy copy/colour audit remains. |
| Mobile 3D | Partial | Antialiasing, DPR cap 2, multisampling, adaptive quality, disposal and visibility-based SceneSurface activation. Existing poster retained. Next: actual phone FPS/edges and a matching high-quality raster still. Legacy renderers are not one global WebGL context pool. |
| Owner workspace | Functional; premium scope partial | Isolated sidebar/topbar/drawer, real counts, paginated records, inbox status/notes/retry/export, editors, security controls, sidebar preference and unsaved-editor warning. Next: command palette, kanban, follow-ups/tags, bulk actions, sorting, Undo and richer shortcuts. |
| Blog | Basic CMS done; advanced scope deferred | Draft/publish/future date, unique addresses, safe escaped text/code renderer, public pages/sitemap. Next: sanitized Markdown pipeline, revisions/autosave, preview, SEO fields, uploads, RSS and table of contents. |
| Tracker/client portal | Not done | No partially protected portal is exposed; reserved collections/indexes only. Next: client-scoped data functions/IDOR tests, then single-use magic-link login and UI. |
| Media/GridFS UI | Not done | Old upload route is owner-guarded and deliberately unavailable. Next: 8 MB/magic-byte validation, GridFS storage and authorized attachment serving. |
| Public premium features | Partial | Original robot/spotlight retained; homepage intro/availability reads saved settings. Next: footer settings, visitor palette, multi-step/no-JS brief, sticky story and full motion polish. |
| Optional cable scene | Skipped | Implement only after core acceptance and a measured performance budget. |
| Legacy chat/metrics | Intentionally unavailable | Transient endpoints disabled and launchers/background calls removed. Contact is the supported path. Next: Mongo-only scoped chat if required. |
| Deployment | Not performed | Configure your environment, migrate/setup/enroll owner, install/build and deploy to Preview. |

No original source files were deleted. Old tests/reports remain as history and are not current acceptance evidence. See CHANGES.md for safe-to-delete items and exact decisions.
