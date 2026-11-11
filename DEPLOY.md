# Deploy Hash Decode

Read PROGRESS.md first: this is a foundation release with a functional admin/basic blog, not the entire premium CMS/portal brief. No account access, deployment, credentials or paid service setup is included. Node 24.22.1 was used for validation; use Node 24 for the native TypeScript CLI/test runner. Framework versions and build tooling are unchanged.

## Environment variables

| Name | Production | Preview / development |
| --- | --- | --- |
| MONGODB_URI | Atlas URI using a production-only DB user; include `/hashdecode_prod?retryWrites=true&w=majority` | Preview-only user and `/hashdecode_preview`; local `_dev` DB |
| MONGODB_DB_NAME | `hashdecode_prod` | `hashdecode_preview` or `hashdecode_dev` |
| APP_ENV | `production` | `preview` or `development`; platform VERCEL_ENV takes precedence |
| APP_ORIGIN | Exact browser origin, e.g. `https://hashdecode.com`, without trailing slash | Exact Preview origin, or omit to compare with the request's origin; local `http://localhost:3000` |
| SITE_ORIGIN | Canonical HTTPS public origin | Preview HTTPS origin, or omit for noindex metadata |
| ENCRYPTION_KEY | 32 random bytes as 64 hex characters | A different random key per environment; encrypts TOTP secrets |
| RESEND_API_KEY | Domain-scoped Resend sending key | Separate Preview key; optional until email testing |
| EMAIL_FROM | An address at your verified sending domain | Verified test sender; no fallback sender |
| EMAIL_TO | Owner notification mailbox | Test recipient; no hard-coded default |
| SERVICE_AREA | Optional accurate service area | Optional |
| TEST_MONGODB_URI | Do not set in production | Isolated test instance; tests create/drop their own unique database |
| VERCEL / VERCEL_ENV | Set by Vercel | Do not forge on another host; selects the original Next build path and trusted client-IP header |

Copy .env.example to .env.local for CLI work. Never upload .env.local. Generate a key with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Back it up privately and separately from the DB. Losing it requires admin:reset and new authenticator enrollment; do not rotate it blindly.

## Atlas

Create one least-privilege database user per environment with readWrite only on its own database. Use separate operator credentials for maintenance if appropriate. URL-encode special characters in credentials and paste the URI without angle brackets. The code does not try to repair credentials. Database names must end in `_prod`, `_preview` or `_dev` for the selected environment. Never give Preview production credentials.

In Atlas Network Access, allow the actual egress addresses used by your deployment. If fixed Vercel egress is unavailable, Atlas's broad access option may be necessary; use strong credentials, TLS and database-scoped users, and restrict the allowlist when fixed egress becomes available. No paid network service is mandated. Apply variables to the correct Vercel Production/Preview scopes, then redeploy.

## Install and initialize

```sh
npm install
npm run typecheck
npm run test:security
```

Only qrcode@1.5.4 was added (terminal QR enrollment). The original pnpm lockfile is retained, as requested. npm install resolves the updated package.json. If you later use frozen pnpm CI, refresh its lockfile yourself first.

Existing database: back up before explicit migration:

```sh
npm run backup -- /private/backups/hashdecode-before-upgrade
npm run migrate:legacy -- --apply
npm run db:setup
```

Migration copies missing records from legacy studio_content and old JSON settings into founders/posts/site settings. Canonical records win; no canonical names, biographies or edits are overwritten. It fills absent structural fields and maps legacy inquiry email statuses. Legacy collections are not deleted. Review conflicts manually. Unique-index errors stop setup rather than deleting duplicates. Review old project types in the editor: choose Studio concept or Client project. Lost in-memory/browser-only records cannot be recovered from Atlas by this migration.

New database:

```sh
npm run db:setup
npm run seed
```

Seed inserts neutral site settings only when that collection is empty. No invented founders/projects/posts are seeded. Create real content in the admin. Setup creates unique, query and TTL indexes. No startup/login seeding exists; expiration is checked by the app without waiting for TTL deletion.

## Owner setup and recovery

```sh
npm run admin:create
```

Use an interactive terminal. Enter the email and a 14–256-character password; password input is hidden. Scan the terminal QR code with an authenticator, verify a code and save the ten recovery codes shown once. The TOTP secret is encrypted; recovery codes are hashed. Wait for the NEXT authenticator code before signing in because enrollment consumes the current one. There is one owner and no signup API.

Use HTTPS. Cookies are always `__Host-hd_admin; Secure; HttpOnly; SameSite=Strict; Path=/`, without Domain. No token is returned in JSON or accepted as a bearer token. Do not weaken cookies for HTTP LAN testing; use HTTPS Preview.

Break-glass with database access:

```sh
npm run admin:reset
```

The CLI asks for confirmation, replaces password/2FA and revokes all sessions. Old ADMIN_PASSWORD, OWNER_PASSWORD_HASH, JWT_SECRET and stored browser tokens no longer authenticate. Security actions in the web UI need a fresh TOTP reauthentication within five minutes.

## Resend and DNS

The source already used Resend. This version keeps its HTTPS API using native fetch. No live email was sent during development.

1. Add your sending domain/subdomain in Resend and copy the exact SPF and DKIM record names/values it supplies into DNS. Do not guess DKIM keys. Copy any provider-requested return-path MX/TXT records too.
2. Verify the domain and use EMAIL_FROM at that domain. Maintain one SPF TXT record per hostname; combine authorized senders instead of publishing conflicting SPF records.
3. Start DMARC at `_dmarc.<your-domain>` with `v=DMARC1; p=none`. Add a `rua=mailto:` address only when a real reporting mailbox is ready. Review alignment before considering enforcement.
4. Configure RESEND_API_KEY, EMAIL_FROM and EMAIL_TO separately in Production and Preview. Old RESEND_FROM/MAIL_FROM/MAIL_TO aliases are not used. Redeploy.
5. In Settings, choose Send test email. The UI shows the actual provider message ID or error. Check the recipient inbox and Resend dashboard.
6. Submit a contact brief and inspect Inbox email status. Sent means provider acceptance, not guaranteed inbox delivery. Missing config is skipped; provider rejection is failed; interrupted processing can leave pending. Fix config and use Resend email. An explicit resend intentionally creates another notification.

Inquiry persistence happens before email. The send is awaited, subject CR/LF is removed, every HTML field is escaped, plain-text and HTML parts are sent, and Reply-To is the validated visitor address. Newsletter duplicate requests return the same success message and do not generate unsolicited owner emails.

## Build and deployment

```sh
npm run build
# Unix shell: exercise Vercel's Next path locally
VERCEL=1 npm run build
```

The original wrapper runs Vinext/Vite locally and Next on Vercel. The original npm start remains Wrangler-based; tooling was not changed. After a Next build, `node node_modules/next/dist/bin/next start` can be used for a local Next smoke check with environment variables set. Validate Vercel runtime separately.

Redeploy after changing env variables. Run Settings → Check connection and complete MANUAL_TEST.md in Preview before production. CSP remains report-only until real reports/Three.js behavior have been reviewed. Browser production source maps are disabled.

## Backup and restore rehearsal

`npm run backup -- /private/new-directory` exports every collection to Extended JSON lines, including GridFS chunks when present, plus an index/count manifest. It refuses an existing destination and creates files with restrictive permissions. Backups contain private data and credential hashes: encrypt before offsite storage. This is not a transactional point-in-time snapshot; pause writes or use Atlas snapshot facilities when consistent multi-collection capture is required.

Restore into a separate EMPTY rehearsal database with its own user. Import each JSONL file with MongoDB Database Tools: `mongoimport --uri '<REHEARSAL_URI>' --db '<REHEARSAL_DB>' --collection '<name>' --file '<name>.jsonl'`. Use Extended JSON lines, no --jsonArray, and never --drop. Recreate indexes from the manifest/db:setup. Compare counts, dates, ObjectIds and any binary GridFS data. Restore the matching encryption key privately, revoke restored sessions, then test owner reset/login, an inquiry and a post. Do not restore auth/session records into a live environment without a revocation plan. This rehearsal is documented but not performed on your accounts.

Sources: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html ; https://resend.com/docs/api-reference/emails/send-email ; https://resend.com/docs/dashboard/domains/introduction .
