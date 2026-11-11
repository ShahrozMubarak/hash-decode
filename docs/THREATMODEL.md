# Threat model

Assets: owner password/TOTP secret, recovery/session tokens, private inquiries, unpublished content, settings and audit history. Actors: visitors, spammers/credential guessers, hostile cross-origin sites, holders of a stolen cookie/database backup, and trusted infrastructure operators.

Controls: a single MongoDB source with explicit failure; environment-specific DB naming/credentials; scrypt N=131072/r=8/p=1 password hashes and dummy checks; AES-256-GCM encrypted RFC 6238 TOTP with atomic replay prevention; random hashed single-use recovery codes; IP/account database lockout/backoff and notifications; random 256-bit cookie-only hashed sessions with idle/absolute expiry, UA binding and credential-version revocation; requireOwner on every admin API; strict Origin/Host plus per-session CSRF; fresh TOTP reauth for sensitive actions; schema validation, body bounds and durable limits; save-first awaited escaped email; escaped React article text; uploads disabled pending validation; fixed-provider scanning instead of arbitrary URL fetching; report-only nonce CSP, other security headers and private no-store/noindex responses.

Only Vercel's overwritten IP header is trusted on Vercel. Other hosts share a conservative local bucket. IP-prefix hashes are recorded but not hard-bound because mobile addresses change. Client submission timestamps are light spam signals, not proof of humanity. “Sent” email means provider acceptance. Audit APIs append only, but a database administrator can alter logs. Backup exports are not point-in-time snapshots.

Not covered: compromised host/browser/device, phishing-resistant passkeys (TOTP remains phishable), stolen valid cookies with matching UA, volumetric DDoS/paid WAF, malware scanning, immutable external logs, automatic key rotation, regulatory certification, independent penetration testing or guaranteed email delivery. No portal/portal IDOR protection is claimed. Atlas/Vercel/Resend account settings, restore rehearsal and physical phone performance remain acceptance work.

Reference: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
