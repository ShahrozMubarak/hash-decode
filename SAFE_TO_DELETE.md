# Obsolete / Deprecated Files (Safe to Delete)

The following files are preserved in the repository in accordance with the safe-integration policy, but are obsolete and safe to delete once verified:

### 1. Cloudflare / Drizzle Database Layer (Replaced by Unified MongoDB)
- `db/index.ts`
- `db/schema.ts`
- `drizzle/` (entire directory of SQL migrations)
- `drizzle.config.ts`
- `cloudflare-env.d.ts`

### 2. Legacy Auth & Seeding Scripts
- `scripts/owner-hash.mjs` (superseded by `scripts/admin-owner.mjs`)
- `scripts/seed-samples.ts` (quarantined sample data)
- `scripts/seed-posts.ts` (quarantined sample posts)

### 3. Historical Verification & Legacy Test Files
- `tests/studio.test.mjs`
- `tests/showcase.test.mjs`
- `tests/backend-mongodb-security.test.mjs`
- `tests/challenger-adversarial.test.mjs`
- `tests/register.mjs`
- `DELIVERY_REPORT.md` (historical delivery report superseded by `CHANGES.md` and `DEPLOY.md`)
- `verification/check-*` and old Lighthouse reports

### 4. Legacy Compatibility Components & Wrappers
- `components/studio/Admin.tsx` (now re-exports `OwnerDashboard`)
- `components/studio/EditorialAdmin.tsx` (now re-exports `OwnerDashboard`)
- `components/studio/FoolishAdminDashboard.tsx` (now re-exports `OwnerDashboard`)
- `components/studio/AdminSessionGuard.tsx` (client guard replaced by server-side authorization)
- `components/studio/Chat.tsx` (transient chat disabled)
- `components/studio/HumanCheck.tsx` (Turnstile arithmetic challenge disabled)
- `lib/platform-db.ts` (local SQLite/Map store replaced by MongoDB)
- `lib/cloudflare-shim.ts` (mock Cloudflare bindings)
