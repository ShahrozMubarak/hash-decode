# Hash Decode changes

## Scope

Mongo-only persistence, validated forms, save-first email, mandatory owner 2FA/revocable sessions, functional isolated admin/basic blog, and shared layout/3D corrections. PROGRESS.md identifies partial/deferred requirements. No Git, remote account access, deployment or destructive data cleanup was performed.

## FOUND / NOT FOUND audit

References in this table are original file:line positions in the supplied ZIP, not the rewritten files. These are source findings, not proof of your live account configuration.

| Suspected cause | Finding |
| --- | --- |
| In-memory stores | FOUND — lib/platform-db.ts:216,220 creates a Map-backed SQL substitute. Retired. |
| Local filesystem persistence | FOUND — lib/platform-db.ts:614–619 creates .sqlite/studio.db. Retired. |
| localStorage auth/editable data | FOUND for auth — components/studio/OwnerSession.tsx:54 stores a token/email. No localStorage source of canonical editable records was found in reviewed active paths. Only UI preferences remain; old auth storage is cleared. |
| Missing/failed Mongo falls back | FOUND — lib/mongodb.ts:69,94 returns null; lib/studio-data.ts:64 merges static concepts; lib/cms.ts:51,64 merges initial posts/local rows. Replaced by explicit errors. |
| Startup/login seed overwrites edits | NOT FOUND in reviewed active flows — app/admin/page.tsx:16 onward performs reads. Static/local precedence explains the observed behavior without a proven startup seed. New seed is CLI-only. |
| Admin initialized from defaults/saved back | FOUND for default-filled input — lib/studio-data.ts:64,108 supplies samples. Normal edits could save them; no automatic login save was found. |
| Cloudflare-only storage on Vercel | FOUND — db/index.ts:1 uses drizzle D1; lib/platform-db.ts:6,709 selects Cloudflare/local adapters. Active paths now use Mongo. |
| Writer/reader mismatch or hidden rows | FOUND — lib/mongodb.ts:280,286 writes studio_content and founders; lib/studio-data.ts:164 reads merged team content. app/page.tsx:12 filters projects to static concepts with a mismatched kind. Fixed. |
| Caching as proven disappearance cause | NOT FOUND as a proven cause — app/admin/page.tsx:16 already force-dynamic. Invalidation was inconsistent; writes now invalidate affected pages, private APIs are no-store. |
| Success after failed save | FOUND — app/api/inquiries/route.ts:196–215 catches local insert failure, ignores Mongo's boolean and returns 201. Fixed. |
| Email not awaited | NOT FOUND — app/api/inquiries/route.ts:192 awaits mailBrief. Actual defect: sending before saving. |
| Unverified/default sender | FOUND as a risk — lib/notify.ts:23 substitutes onboarding@resend.dev. Actual DNS verification cannot be known from source. Fallback removed. |
| Swallowed email errors | FOUND — lib/notify.ts:57 returns only a status string; details were not retained. New status/error/provider ID is owner-visible. |
| Email only attempted after failed save | NOT FOUND — app/api/inquiries/route.ts:192,196 sends before saving. New order is save first. |
| URL auth value | FOUND — components/studio/OwnerSession.tsx:24 adds ?auth=Date.now() for navigation/cache busting. It was a timestamp, NOT the bearer credential; the credential was in localStorage and headers. Both conventions removed. |
| Default credential/stateless revocation bypass | FOUND — lib/owner-session.ts:16 provides a default credential; :183,246 supports a stateless fallback after database checks. Removed. |

## DECISIONS

- Keep Next 16.4.3, React 19.3.1, TypeScript 5.9.3 and the existing build wrapper/tooling. No framework upgrade or new animation library.
- Use built-in asynchronous scrypt N=131072/r=8/p=1 with random salts, dummy verification and timing-safe comparisons. Mandatory TOTP is AES-GCM encrypted. Only CLI recovery can replace 2FA; no web disable switch.
- Keep the source's Resend provider using native fetch. Require explicit EMAIL_FROM/EMAIL_TO; never guess addresses. Provider acceptance is recorded as sent, not guaranteed inbox delivery. Notify on every login rather than pretending UA hashes reliably identify devices.
- Require environment-specific DB names/credentials. Canonical data wins during explicit insert-only migration. No automatic samples, destructive deduplication or database wipe. Expiry is checked in the app, independently of Mongo TTL cleanup.
- Favor dynamic public reads and write invalidation over caching complexity in this release. Missing DB config is an error; empty collections stay empty. A measured short-cache rollout is deferred.
- Keep escaped React text/code blocks for the basic blog. Do not claim a full Markdown CMS, revisions, uploads or portal. Those require a separate coherent implementation.
- Disable unsafe legacy chat/metrics/challenge/upload behavior. Authenticated uploads explicitly report unavailable; no partially protected portal is exposed. Contact is the supported communication path.
- Keep Secure cookie flags even for local testing; use HTTPS Preview instead of an insecure LAN exception. Audit APIs are append-only, but DB administrators can still alter logs.
- Preserve robot/card spotlight assets. Content stays visible if reveal code fails. Existing poster is retained; a new raster fallback and measured handset FPS are deferred.
- Preserve original files; replace obsolete implementations with fail-closed compatibility modules where appropriate. Old tests/reports remain historical, not current acceptance evidence.

## Packages and commands

Only added package: **qrcode 1.5.4** for terminal TOTP enrollment. Existing zod/mongodb/Three/build dependencies retain their versions; native fetch needs no email SDK. Original pnpm-lock.yaml is retained for you to refresh.

```sh
npm install qrcode@1.5.4
npm install
npm run typecheck
npm run test:security
TEST_MONGODB_URI=mongodb://127.0.0.1:27017 npm run test:integration
npm run build
VERCEL=1 npm run build
npm audit
```

Run npm audit on the whole graph, especially Next/React/react-server-dom-webpack, mongodb, zod, qrcode, three, vinext/Vite/Wrangler and transitive packages. Keep Next patched after reviewing that audit; no framework upgrade was made here. npm audit is recommended, not claimed as executed. Tested Node runtime: 24.22.1; use Node 24 for native TypeScript CLI/tests and import hooks.

## Verification and limits

Current outputs in verification/: typecheck.txt, security-tests.txt, mongo-integration.txt, next-build.txt, local-build.txt and http-checks.json. Strict TypeScript includes noUnusedLocals/noUnusedParameters. Eight unit tests and ten Mongo integration subtests (eleven including parent) passed against isolated MongoDB 7.0.16. Route integration stubs only Next cache invalidation; production HTTP checks exercise the real server. HTTP checks cover nine routes, cookie flags, owner login/dashboard isolation, contact-to-inbox persistence, export reauth denial and logout revocation.

The replay regression test captures/reuses the exact code to avoid accidentally generating a new code across a 30-second boundary. No implementation exception to replay rejection was introduced.

NOT VERIFIED: live Atlas/Vercel settings, actual Resend delivery/DNS, backup restore rehearsal, physical-phone performance or rendered 390px/1440px layouts. Chromium was attempted but blocked by socket() failed: Operation not permitted. HTTP checks are not visual proof. No portal/advanced CMS/media tests are claimed. Other pre-existing verification logs/Lighthouse reports are historical.

## Safe to delete (not deleted)

- Legacy db/, drizzle migrations and drizzle.config.ts after removing obsolete db:generate usage and checking external consumers.
- lib/platform-db.ts, lib/cloudflare-shim.ts and lib/mongodb.ts compatibility modules only after adjusting build aliases/external imports.
- scripts/owner-hash.mjs (old auth workflow), scripts/seed-samples.ts and scripts/seed-posts.ts (quarantined originals, never seeded automatically).
- Old Admin.tsx, EditorialAdmin.tsx, FoolishAdminDashboard.tsx, AdminSessionGuard.tsx compatibility components; Chat.tsx/HumanCheck.tsx after verifying external imports.
- Historical tests/studio.test.mjs, showcase.test.mjs, backend-mongodb-security.test.mjs, challenger-adversarial.test.mjs and their old register/platform harness. Active suites are security.test.mjs and mongo-integration.test.mjs.
- DELIVERY_REPORT.md and old verification/check-* and Lighthouse outputs are historical. Current documentation supersedes them.

## Files added or changed

- `.env.example` — Added: Environment names without credentials.
- `CHANGES.md` — Added: Document deployment, limitations, decisions or acceptance steps for this release.
- `DEPLOY.md` — Added: Document deployment, limitations, decisions or acceptance steps for this release.
- `MANUAL_TEST.md` — Added: Document deployment, limitations, decisions or acceptance steps for this release.
- `PROGRESS.md` — Added: Document deployment, limitations, decisions or acceptance steps for this release.
- `README.md` — Changed: Document deployment, limitations, decisions or acceptance steps for this release.
- `START_HERE.md` — Changed: Document deployment, limitations, decisions or acceptance steps for this release.
- `app/.well-known/security.txt/route.ts` — Changed: Saved contact email/contact URL.
- `app/about/page.tsx` — Changed: Remove unsupported numeric marketing claims.
- `app/admin/layout.tsx` — Changed: Private owner layout/metadata.
- `app/admin/page.tsx` — Changed: Server owner gate and configuration state.
- `app/api/admin/route.ts` — Changed: Authenticated real-data CRUD, counts, email and security actions.
- `app/api/challenge/route.ts` — Changed: Retire inconsistent arithmetic challenge.
- `app/api/chat/route.ts` — Changed: Explicitly disable transient chat.
- `app/api/check/route.ts` — Changed: Validate fixed-provider scans and standardize API errors.
- `app/api/csp-report/route.ts` — Added: Bound/rate-limit reports without logging attacker-controlled URLs.
- `app/api/inquiries/route.ts` — Changed: Durable idempotent save before email.
- `app/api/metrics/route.ts` — Changed: Disable transient analytics.
- `app/api/session/route.ts` — Changed: Mandatory 2FA, lockouts, cookie-only login/logout.
- `app/api/subscribe/route.ts` — Changed: Persistent unique subscriptions and abuse validation.
- `app/api/upload/route.ts` — Changed: Owner-guard and disable legacy upload pending secure GridFS.
- `app/layout.tsx` — Changed: Dynamic rendering and shared refinements/metadata.
- `app/not-found.tsx` — Changed: Remove unused import.
- `app/owner.css` — Added: Isolated responsive owner-workspace styling.
- `app/page.tsx` — Changed: Remove static-project filter and use saved intro/availability.
- `app/refinements.css` — Added: Shared tokens, heading/spacing/mobile fixes and visible-content fallback.
- `app/robots.txt/route.ts` — Changed: Exclude portal/admin/API paths.
- `app/services/page.tsx` — Changed: Remove unsupported numeric/support promises.
- `app/sitemap.xml/route.ts` — Changed: Published Mongo URLs only, no local-store metadata.
- `components/studio/AboutTeamGrid.tsx` — Changed: Monograms and undecorated quotes.
- `components/studio/Admin.tsx` — Changed: Compatibility export of replacement dashboard.
- `components/studio/AdminSessionGuard.tsx` — Changed: Replace client guard with server authorization.
- `components/studio/Button.tsx` — Changed: Use supplied success state; remove unused setter.
- `components/studio/CodingBackground.tsx` — Changed: Remove emoji.
- `components/studio/ContactForm.tsx` — Changed: Timing/idempotency data and real server error messages.
- `components/studio/DottedModel.tsx` — Changed: Remove unused import.
- `components/studio/EditorialAdmin.tsx` — Changed: Compatibility export of replacement dashboard.
- `components/studio/FoolishAdminDashboard.tsx` — Changed: Replace invented metrics and old auth UI.
- `components/studio/FooterSubscribe.tsx` — Changed: Timing/honeypot and structured errors.
- `components/studio/HackerCoder.tsx` — Changed: Remove unused state.
- `components/studio/MotionLanding.tsx` — Changed: Saved intro/availability, concept copy and empty state.
- `components/studio/OwnerDashboard.tsx` — Added: Functional real-data inbox/editors/settings/security workspace.
- `components/studio/OwnerSession.tsx` — Changed: Cookie-only login with TOTP/recovery and old-token cleanup.
- `components/studio/PageExperience.tsx` — Changed: Avoid private-page effects and remove unused state.
- `components/studio/SceneSurface.tsx` — Changed: Viewport activation, motion preference and two-context SceneSurface cap.
- `components/studio/SecurityChecker.tsx` — Changed: Read standardized scanner envelope.
- `components/studio/Shell.jsx` — Changed: Fix conditional hooks, isolate private routes and remove chat launcher.
- `components/studio/StudioControls.tsx` — Changed: Remove unused state/event bindings.
- `components/studio/TeamStrip.tsx` — Changed: Remove invented fallback founders and use initials.
- `components/studio/ToastManager.tsx` — Changed: Remove unused import.
- `components/studio/TypingSecure.tsx` — Changed: Respect reduced motion.
- `components/studio/Visit.tsx` — Changed: Stop retired metrics requests.
- `docs/THREATMODEL.md` — Added: Document deployment, limitations, decisions or acceptance steps for this release.
- `lib/abuse.ts` — Changed: Atomic persistent request limits and IP lockout.
- `lib/cloudflare-shim.ts` — Changed: Preserve tooling exports without mock data.
- `lib/cms.ts` — Changed: Canonical post/settings reads with scheduled-publication filtering.
- `lib/content-models.ts` — Added: Strict editable-content schemas.
- `lib/db/index.ts` — Added: Globally cached MongoDB client, explicit failures and environment separation.
- `lib/dotted-models.ts` — Changed: Enable antialiasing for legacy dotted rendering.
- `lib/form-validation.ts` — Added: Strict public input schemas and timing checks.
- `lib/http.ts` — Added: Bounded parsing, strict origin checks and safe consistent errors.
- `lib/meta.ts` — Changed: Read origin directly from server environment.
- `lib/mongodb.ts` — Changed: Compatibility re-export instead of multiple data writers.
- `lib/notify.ts` — Changed: Env-only awaited provider delivery with escaped content and explicit results.
- `lib/owner-session.ts` — Changed: Database-only cookie sessions, requireOwner, TOTP consumption, audit and reauth.
- `lib/physical-halo.ts` — Changed: Remove unused helpers.
- `lib/platform-db.ts` — Changed: Fail closed instead of local/in-memory storage.
- `lib/security-crypto.mjs` — Added: Scrypt, TOTP, encryption and recovery/session primitives.
- `lib/studio-data.ts` — Changed: Canonical Mongo portfolio/team/settings reads without static overlays.
- `lib/studio-scene.ts` — Changed: Antialiasing, multisampling, adaptive quality and cleanup.
- `lib/studio-security.ts` — Changed: Centralize legacy security callers on new guards.
- `next.config.ts` — Changed: Enforce type errors and strengthen headers/source-map settings.
- `package.json` — Changed: Add QR enrollment and maintenance/test commands without changing framework/build versions.
- `proxy.ts` — Added: Per-request CSP nonce and private cache/robots headers.
- `scripts/admin-owner.mjs` — Added: Hidden-password CLI owner enrollment/reset with QR/recovery codes.
- `scripts/backup.mjs` — Added: EJSON collection export with restrictive permissions/count/index manifest.
- `scripts/database.mjs` — Added: Shared CLI config and unique/TTL index setup.
- `scripts/db-setup.mjs` — Added: Explicit schema/index initialization.
- `scripts/migrate-legacy.mjs` — Added: Non-destructive legacy Mongo content/settings migration.
- `scripts/seed-posts.ts` — Added: Quarantine original sample posts outside runtime.
- `scripts/seed-samples.ts` — Added: Quarantine original sample input outside runtime.
- `scripts/seed.mjs` — Added: Empty-settings-only seed without invented content.
- `tests/mongo-integration.test.mjs` — Added: Add/update current security regression coverage and test harness.
- `tests/next-cache.mjs` — Added: Add/update current security regression coverage and test harness.
- `tests/security-register.mjs` — Added: Add/update current security regression coverage and test harness.
- `tests/security.test.mjs` — Added: Add/update current security regression coverage and test harness.
- `tsconfig.json` — Changed: Enable unused-symbol checks alongside strict TypeScript.
- `verification/README.md` — Added: Record executed checks and distinguish historical evidence.
- `verification/http-checks.json` — Added: Record executed checks and distinguish historical evidence.
- `verification/local-build.txt` — Added: Record executed checks and distinguish historical evidence.
- `verification/mongo-integration.txt` — Added: Record executed checks and distinguish historical evidence.
- `verification/next-build.txt` — Added: Record executed checks and distinguish historical evidence.
- `verification/security-tests.txt` — Added: Record executed checks and distinguish historical evidence.
- `verification/typecheck.txt` — Added: Record executed checks and distinguish historical evidence.
