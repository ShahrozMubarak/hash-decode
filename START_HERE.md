# Run Hash Decode Studio

Use Node 22.13+ and pnpm 11.25.0. Run `pnpm install --frozen-lockfile`. Configure D1 and apply the SQL migrations in order, including 0003_owner_sessions.sql. Keep real credentials in Worker secrets. Local secrets belong in .dev.vars.

Set SITE_ORIGIN to the real public HTTPS origin at build time and on the Worker. Until then the public index is disabled. To set the owner password, generate a long random password in your password manager. In Bash run:

```bash
read -rs -p 'Owner password: ' studio_password; printf '\n'
printf '%s' "$studio_password" | node scripts/owner-hash.mjs | pnpm exec wrangler secret put OWNER_PASSWORD_HASH --config dist/server/wrangler.json
unset studio_password
```

Sign in at /admin over HTTPS. Changing the password hash invalidates all existing sessions. To enable email set RESEND_API_KEY, MAIL_FROM and MAIL_TO. Configure both Turnstile keys together or use the one-time fallback challenge. Set WhatsApp and booking URLs in the owner workspace. Publish actual project and team records there when ready.

## Database and local preview

Keep the DB binding and apply all migrations under drizzle in order: 0000 through 0004, including owner sessions and public-content modification triggers. Back up an existing database before applying migrations. For an external Cloudflare account, set D1_DATABASE_ID to your actual D1 ID before building; the placeholder is for local development only. Set SITE_ORIGIN on the Worker as well as in the build environment. No example QA domain belongs in production configuration.

After building, the generated Worker configuration is dist/server/wrangler.json. Use that configuration for Wrangler migration and secret commands. For local D1, run `pnpm exec wrangler d1 migrations apply DB --local --config dist/server/wrangler.json`, then `pnpm start`. A deployed D1 uses the same command with `--remote` after confirming the intended database. Owner authentication requires HTTPS because its cookie is Secure. The package deliberately contains no real password or account identity.

The deployed site must have an actual SITE_ORIGIN, owner verifier, database and migrations before launch. Email requires RESEND_API_KEY, a verified MAIL_FROM and MAIL_TO. Both Turnstile keys must be supplied together to enable it; otherwise the one-time challenge remains available. Configure real WhatsApp and Calendly/Cal.com booking links in the owner workspace. Add real projects and licensed team photos when available. SERVICE_AREA is optional and should describe the actual service area. Update the security contact configuration for security.txt. The original hosting identity has been preserved; no deployment was performed.

This delivery follows the requested Cloudflare Worker + D1 architecture. The later attachment's optional MongoDB mirror / Node shim is not included. Inquiries and traffic persist in D1. If a separate MongoDB mirror is needed, it requires a distinct supported integration and verification.

## Latest showcase update

Desktop keeps the crossing glowing 8px coral trail, dense morphing dots, camera movement and dark model passages with oversized outlined text. Phones use three locally animated objects (crystal, halo, dotted form) in fixed section slots, glowing checkpoints and no connecting line. Rendering loads near the viewport and pauses offscreen; Data Saver and reduced motion use static posters. The menu is a keyboard-accessible native dialog. Public inner pages add lightweight dotted studies; admin entry and sections share the visual motion system.

The supplied HTML is an offline visual preview, not the running React application. Use the full project to review WebGL, navigation, forms and owner authentication. Nothing has been published.
