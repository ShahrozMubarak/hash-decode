# Preview acceptance: 15 steps

Use an isolated database and HTTPS. Never mark an unchecked/unavailable feature as passed.

1. Settings → Check connection must show the Preview DB name/counts. Test missing/wrong config in a separate deployment: admin reports an issue and forms must not claim success.
2. Submit a valid contact brief after two seconds. Its reference/data must appear once in Inbox. Retry the same submission: no duplicate record.
3. Confirm notification/Reply-To in the actual inbox. Test bad email config: inquiry persists with failed/skipped status. Restore config and test Resend email and Send test email.
4. Subscribe twice: identical responses, one row. Test malformed email, operator-shaped JSON, honeypot, fast submission, excessive links, >20 KB body and rate limits.
5. Wrong email/password/code gets generic failure; fifth failed attempt locks IP/account. Test valid fresh TOTP and single-use recovery. URL stays /admin with no auth parameter. Reused code fails.
6. Inspect Secure/HttpOnly/SameSite=Strict/Path=/ cookie flags and no Domain. In an isolated test DB, age lastSeenAt beyond 30 minutes and separately expire expiresAt. Sign out and Sign out everywhere revoke access across browsers.
7. Without auth, admin APIs/upload refuse access. With auth but missing/incorrect CSRF or cross-origin POST, writes fail. Private responses must be no-store/noindex.
8. Edit founder/project, save, logout/login, and check admin/public persistence. Test draft/published visibility and migrated legacy content.
9. Create a draft blog post: private. Publish: page/sitemap visible. Future publishAt: private until due. HTML-looking content must render as escaped text.
10. Export/password/recovery changes without reauth fail. Verify a fresh TOTP, export and inspect formula-leading CSV cells. Change password: every session revoked, old password rejected, security notification/audit present.
11. Portal invite/login/IDOR tests are NOT AVAILABLE in this release. No portal was shipped; do not mark these passed. Add client-scope/IDOR tests before exposing it.
12. At 390×844 check Home/About/Work/Blog/Contact/Admin: no document horizontal scroll, clipped text/fields or hidden cards; initials fit; drawer works.
13. At 1440px check sticky header, no public header/footer in admin, label/heading hierarchy, spacing and button separation. Disable JS/observer: content remains visible. Contact submission currently needs JS.
14. On a physical phone check robot edge quality, canvas dimensions, no empty bands, offscreen/hidden-tab pause, reduced motion and WebGL failure poster. Verify the original card spotlight remains. No measured 60fps claim is made.
15. Verify robots/sitemap/security.txt/headers, no client secrets, a private backup and isolated restore per DEPLOY.md. Review real CSP reports and actual email DNS/delivery before production.
