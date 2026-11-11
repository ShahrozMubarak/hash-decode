# Updated release

Start with START_HERE.md, DEPLOY.md and PROGRESS.md. Legacy auth/database instructions below are superseded and retained only as source history.

# Hash Decode Studio

Unpublished React/Vinext source for a software and web-security studio, using a Cloudflare Worker and D1. Read START_HERE.md before configuring hosting and DELIVERY_REPORT.md for verification results and limitations.

The landing page retains the studio's dotted hash, knot, sphere and torus on desktop, with scroll-driven camera changes, a coral trail and checkpoints. Existing crystal and halo studies share the second scene. At 850px and below, only one crystal rotates in its fixed hero slot. Mobile backgrounds stay static and the decorative trail is hidden. No new model downloads were added in the final refinement.

Real HTML carries the content. Reduced motion, Pause Motion, static posters, context-loss handling, self-hosted fonts, lazy 3D and capped rendering budgets support slower devices. Project entries remain labelled studio concepts. No fabricated endorsements or performance claims are displayed.

## Owner workspace

/admin uses a configured password verifier, expiring opaque sessions stored as hashes in D1, HttpOnly/Secure/SameSite=Strict cookies, login throttling and logout. Unsigned identity headers grant no access. The workspace manages projects, inquiries, copy, articles, real team entries, sourced reviews and contact links. Session expiry prompts the owner to preserve unsaved edits and sign in again. There is no public account registration.

## Validation

Use Node 22.13+ and pnpm 11.25.0:

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm test
pnpm lint
pnpm audit
pnpm build
```

The configured test command exercises real handlers against isolated SQLite. External provider responses are mocked. Production email, Turnstile, domain indexing and edge performance need configured credentials and a real deployment.

## Model attribution

Enchanted Crystal by TheTallOne, CC BY 4.0:
https://sketchfab.com/3d-models/enchanted-crystal-6b01945a041d4ed3b80e14274f0e68c9
https://creativecommons.org/licenses/by/4.0/

The source geometry and transforms are retained; texture maps were removed and runtime materials adapted to the brand. Original dotted and halo geometry is retained. Font licences are included under public/fonts.
