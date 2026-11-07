# Hash Decode Studio — delivery report

Status: source delivered, NOT published. Latest correction preserves the original open desktop story composition: three-line hero, architecture narrative, full-width model stage, security passage and craft statement. The coral trail now curves across the page, with an 8px stroke (4× the previous 2px) and layered coral glow. Desktop dotted shapes scatter and reform every 6.8 seconds, respond to the pointer and clicks, and move between sides with scroll. Mobile now has three stationary model sections: the hero crystal, the collection halo and an interactive dotted form in the security section. The supporting services/work/process/FAQ/contact content and security improvements remain. Phone models rotate or scatter locally without travelling between sections; the Hash Cube added in the earlier phase is retained as reusable code but removed from the landing UI, following your latest instruction.

The latest visual pass removes the above-header preview notice and introductory decode overlay, reduces service/process/security copy, adds deep navy crystal and security passages, and uses oversized outlined background lettering. Active colours use the Azure #3283BE / Snow #FEFDFE / Coral #FD614B variables and navy derivatives.

## Work by phase

1. **Security:** removed bundled local credentials and unsigned ChatGPT identity authentication. Added salted PBKDF2 owner credentials, hashed opaque D1 sessions, four-hour expiry, credential-rotation invalidation, Strict/Secure/HttpOnly cookies, rate-limited sign-in and logout. Added session-status checks and a styled owner sign-in form with password visibility. Admin forms prevent duplicate writes and show generic failures; expired sessions prompt reauthentication. Added migration 0003. Worker uses fresh script nonces, denies framing, adds COOP, and permits Turnstile only when configured. Same-origin, input bounds, email validation, quotas and one-time human verification remain enforced.
2. **Landing:** semantic, crawlable hero and services; labelled studio concepts; honest security/process copy; stack, FAQ and inline brief. No invented clients, endorsements, uptime or model specifications. Shared palette, spacing, typography and self-hosted fonts.
3. **Models:** reused original dotted forms and halo geometry. Removed unused texture payloads from the original crystal and adapted runtime materials. Desktop uses one dotted canvas and at most one collection canvas. Mobile lazily mounts the crystal, halo and procedural dotted form near their sections, with a maximum of two simultaneous canvases observed. Data Saver keeps the poster. No additional model download was generated for the final refinement.
4. **Motion:** one native scroll/rAF controller drives the full-width crossing coral trail, nine checkpoints, current-section label, morphing points, camera yaw/pitch, desktop model travel and desktop light-to-navy background transitions. Mobile hides the connecting trail and replaces it with glowing progress dots. Its three models animate in place and its section backgrounds stay fixed. Desktop camera distance moves through the dotted torus; solid objects use a closer orbit. Reduced motion and Pause Motion show a static experience. Desktop card tilt and subtle texture are retained.
5. **Reliability:** 3D error boundaries, static fallback, WebGL preflight, context loss/restoration, eight-second crystal timeout, offscreen/tab suspension, pixel-ratio/frame caps and generic app/global errors. Main forms use request timeouts, disabled sending states and brief idempotency to avoid repeated submission.
6. **SEO/performance:** one SITE_ORIGIN drives canonical/OG/schema/sitemap/robots. Home has a five-minute anonymous Worker HTML cache with fresh per-response script nonces; no force-dynamic home export. Added Organization/WebSite/ProfessionalService/FAQPage JSON-LD, a 1200×630 OG image and real-content update triggers (migration 0004). Fonts are self-hosted. Three and models load lazily.
7. **Consistency:** common header/footer, navy readable text, coral buttons, skip link, focus rings, keyboard model tabs, touch targets, responsive inner pages and polished admin entry/dashboard styling. A native modal menu adds large numbered links, staggered entrance, focus containment and Escape dismissal. Public inner pages receive lazy dotted object panels; page and admin sections reveal on entry.

## Validation

- Final `pnpm exec tsc --noEmit`: PASS.
- Final `pnpm test`: PASS, 19 tests. Covers owner authorization, forged headers, cookie flags/expiry/revocation, login throttling, CMS actions, one-time checks, brief retry idempotency, scanner restrictions, analytics opt-out, model budgets/asset bounds, camera interpolation, timed scatter/reassembly, schema and cache exclusions.
- Final `pnpm build`: PASS.
- `pnpm lint`: PASS with four unused-code/import warnings in retained physical-halo helpers and legacy test helpers; zero errors.
- `pnpm audit`: zero vulnerabilities reported, including development dependencies.
- Explicit saved tsc/test/build gates are included for phases 5, 6, 7 and the final refinement. Earlier work was checked during development, but a complete per-phase 1–4 log set is not available for independent verification.
- Real production Worker fixture rendered all tested public routes and the admin sign-in route; the intentional missing route returned 404. All listed routes had one H1 and no 360px overflow.
- The trail computes to 8px on desktop; mobile crystal document position is unchanged by scrolling. Gallery arrow-key navigation, actual crystal/halo rendering, Pause Motion, reduced motion, schema output and fresh matching CSP nonces passed.
- Mobile checks exercised all three model sections, glowing progress dots and no visible connecting trail. Desktop checks covered the dotted stage, 8px trail, and the model collection. Menu open/Escape-close and removal of the top banner passed.

| Width | Document width | Horizontal overflow |
|---:|---:|---|
| 360 | 360 | No |
| 390 | 390 | No |
| 768 | 768 | No |
| 1024 | 1024 | No |
| 1440 | 1440 | No |
| 1920 | 1920 | No |

## Lighthouse mobile — local production Worker fixture

| Measure | Result |
|---|---:|
| Performance score | 98 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 92 |
| Largest contentful paint | 1.86 s |
| Cumulative layout shift | 0.0387 |
| Total blocking time | 0 ms |

These are laboratory results, not live-domain measurements or a promise of field performance. The fixture serves actual built assets and real Worker responses through browser request interception. Lighthouse's separate robots fetch could not use that transport, although a direct Worker robots request returned 200. Field INP and real mid-range phone GPU/battery use remain unverified. Re-run Lighthouse and collect field Web Vitals after launch. Raw results are included under verification/.

## Assets

| Asset | Original | Delivered |
|---|---:|---:|
| enchanted_crystal.glb | 8,191,452 bytes | 15,396 bytes |
| Titanium Halo | Procedural original | No model download |
| Desktop dotted forms | Procedural original | Reused; capped particle budget |
| Hash Cube | Added in earlier phase | Reusable code only, absent from final landing |

Crystal compression removed four embedded texture maps and unused vertex attributes, preserving the 388 vertices / 336 triangles and scene transforms. No Draco/meshopt decoder is necessary for this small result. Attribution and font licences remain included. Palette-derived environment lighting is procedural, with no external environment download.

## Before launch

Follow START_HERE.md. Supply an actual SITE_ORIGIN, D1 database ID/binding, apply migrations 0000–0004, and configure OWNER_PASSWORD_HASH using the included stdin-only credential script. Real credentials are intentionally absent. Supply RESEND_API_KEY, verified MAIL_FROM and MAIL_TO; optionally both Turnstile keys; real WhatsApp/booking links; actual service area; real project records and team photos. The existing contact page is the security.txt contact route. Review your public content and concept labels before enabling indexing.

## Limits and differences to review

- No site was published and no production secrets, database, email delivery, Turnstile account or booking flow was configured or exercised.
- This build uses the requested Cloudflare Worker + D1 architecture. The newer attachment's optional MongoDB mirror and Node shim were not carried into this continuation; inquiries and analytics persist in D1. A MongoDB mirror needs a separate compatible integration and tests.
- The source's dormant challenger-adversarial test suite was already outside its test command and refers to missing legacy components. It is retained unchanged rather than presented as passing. Automatic approval review rejected broad deletion/replacement of legacy source and tests; those files remain. Some inactive legacy Field assets still contain older colour literals. The active landing uses the shared palette.
- Browser fixture logs include a 404 from the deliberately missing page. No uncaught page exception was observed. The separate cloud preview browser used static fallbacks; the WebGL-enabled production fixture confirmed live desktop dots, crystal, halo and mobile dotted rendering. Production-provider behaviour still needs a configured live smoke test.
- All formal gates ran on the final code. Lighthouse/browser checks were repeated after the original-composition correction. See verification/check-rich-final-* for its TypeScript/test/build results.
- The original desktop composition and crossing trail have been restored in this correction. Typography, copy and supporting content retain the accessibility/security cleanup; this is a polished adaptation, not a byte-for-byte restoration of the old page.

## Dependency changes

### dependencies

| Package | Previous | Delivered |
|---|---|---|
| @base-ui/react | ^1.7.0 | Removed |
| @hookform/resolvers | ^5.7.1 | Removed |
| @shadcn/react | ^0.3.0 | Removed |
| class-variance-authority | 0.7.1 | Removed |
| clsx | 2.1.1 | Removed |
| cmdk | ^1.1.1 | Removed |
| date-fns | ^4.4.0 | Removed |
| drizzle-orm | 0.45.2 | 0.45.4 |
| embla-carousel-react | ^8.6.0 | Removed |
| input-otp | ^1.4.2 | Removed |
| mongodb | ^7.7.0 | Removed |
| next | 16.3.4 | 16.4.3 |
| next-themes | ^0.4.6 | Removed |
| radix-ui | ^1.6.7 | Removed |
| react | 19.2.6 | 19.3.1 |
| react-day-picker | ^10.0.1 | Removed |
| react-dom | 19.2.6 | 19.3.1 |
| react-hook-form | ^7.85.0 | Removed |
| react-resizable-panels | ^4.12.2 | Removed |
| recharts | ^3.8.0 | Removed |
| sonner | ^2.0.8 | Removed |
| tailwind-merge | 3.6.0 | Removed |
| three | ^0.186.1 | 0.186.1 |
| vaul | ^1.1.2 | Removed |
| zod | ^3.25.76 | 4.6.7 |
### devDependencies

| Package | Previous | Delivered |
|---|---|---|
| @cloudflare/vite-plugin | 1.37.1 | 1.66.0 |
| @cloudflare/workers-types | 4.20260515.1 | 5.20261023.1 |
| @tailwindcss/postcss | 4.2.1 | Removed |
| @types/react | 19.2.14 | 19.3.0 |
| @types/react-dom | 19.2.3 | 19.3.0 |
| @types/three | ^0.186.0 | 0.186.0 |
| @vitejs/plugin-react | 6.0.2 | 6.1.2 |
| @vitejs/plugin-rsc | 0.5.26 | 0.5.38 |
| drizzle-kit | 0.31.10 | 0.31.11 |
| eslint | 9.39.4 | 9.39.5 |
| eslint-config-next | 16.3.4 | 16.4.3 |
| react-server-dom-webpack | 19.2.6 | 19.3.1 |
| tailwindcss | 4.2.1 | Removed |
| tw-animate-css | ^1.4.0 | Removed |
| vinext | 1.0.0-beta.5 | 1.4.0 |
| vite | 8.0.13 | 8.3.5 |
| wrangler | 4.92.0 | 4.154.0 |

## Every source file changed

Compared with the supplied hash-decode-source (1).zip. Generated dependencies, build output and local runtime data are excluded.

| Action | File |
|---|---|
| Modified | `.env.example` |
| Modified | `.gitignore` |
| Added | `.openai/hosting.json` |
| Added | `DELIVERY_REPORT.md` |
| Modified | `README.md` |
| Modified | `START_HERE.md` |
| Added | `app/.well-known/security.txt/route.ts` |
| Modified | `app/about/page.tsx` |
| Modified | `app/admin/page.tsx` |
| Modified | `app/api/admin/route.ts` |
| Modified | `app/api/challenge/route.ts` |
| Modified | `app/api/chat/route.ts` |
| Modified | `app/api/inquiries/route.ts` |
| Modified | `app/api/metrics/route.ts` |
| Added | `app/api/session/route.ts` |
| Modified | `app/blog/[slug]/page.tsx` |
| Removed | `app/chatgpt-auth.ts` |
| Modified | `app/contact/page.tsx` |
| Added | `app/error.tsx` |
| Added | `app/global-error.tsx` |
| Modified | `app/globals.css` |
| Modified | `app/lab/[slug]/page.tsx` |
| Modified | `app/layout.tsx` |
| Modified | `app/motion.css` |
| Modified | `app/page.tsx` |
| Modified | `app/portfolio/page.tsx` |
| Modified | `app/privacy/page.tsx` |
| Modified | `app/robots.txt/route.ts` |
| Modified | `app/services/page.tsx` |
| Modified | `app/sitemap.xml/route.ts` |
| Modified | `cloudflare-env.d.ts` |
| Removed | `components.json` |
| Removed | `components/connector-error.tsx` |
| Modified | `components/studio/Admin.tsx` |
| Added | `components/studio/AdminSessionGuard.tsx` |
| Modified | `components/studio/Chat.tsx` |
| Modified | `components/studio/ContactForm.tsx` |
| Added | `components/studio/DottedJourney.tsx` |
| Modified | `components/studio/DottedModel.tsx` |
| Added | `components/studio/DottedPoster.tsx` |
| Modified | `components/studio/EditorialAdmin.tsx` |
| Modified | `components/studio/Extras.tsx` |
| Modified | `components/studio/HumanCheck.tsx` |
| Added | `components/studio/InlineDotted.tsx` |
| Added | `components/studio/JourneyControl.tsx` |
| Modified | `components/studio/Lab.tsx` |
| Added | `components/studio/ModelPoster.tsx` |
| Modified | `components/studio/MotionLanding.tsx` |
| Added | `components/studio/OwnerSession.tsx` |
| Added | `components/studio/PageExperience.tsx` |
| Added | `components/studio/Recovery.tsx` |
| Added | `components/studio/ResponsiveStage.tsx` |
| Added | `components/studio/SceneBoundary.tsx` |
| Added | `components/studio/SceneSurface.tsx` |
| Modified | `components/studio/Shell.jsx` |
| Added | `components/studio/StudioControls.tsx` |
| Modified | `components/studio/Tools.tsx` |
| Modified | `components/studio/Visit.tsx` |
| Modified | `components/studio/Work.tsx` |
| Removed | `components/ui/accordion.tsx` |
| Removed | `components/ui/alert-dialog.tsx` |
| Removed | `components/ui/alert.tsx` |
| Removed | `components/ui/aspect-ratio.tsx` |
| Removed | `components/ui/attachment.tsx` |
| Removed | `components/ui/avatar.tsx` |
| Removed | `components/ui/badge.tsx` |
| Removed | `components/ui/breadcrumb.tsx` |
| Removed | `components/ui/bubble.tsx` |
| Removed | `components/ui/button-group.tsx` |
| Removed | `components/ui/button.tsx` |
| Removed | `components/ui/calendar.tsx` |
| Removed | `components/ui/card.tsx` |
| Removed | `components/ui/carousel.tsx` |
| Removed | `components/ui/chart.tsx` |
| Removed | `components/ui/checkbox.tsx` |
| Removed | `components/ui/collapsible.tsx` |
| Removed | `components/ui/combobox.tsx` |
| Removed | `components/ui/command.tsx` |
| Removed | `components/ui/context-menu.tsx` |
| Removed | `components/ui/dialog.tsx` |
| Removed | `components/ui/direction.tsx` |
| Removed | `components/ui/drawer.tsx` |
| Removed | `components/ui/dropdown-menu.tsx` |
| Removed | `components/ui/empty.tsx` |
| Removed | `components/ui/field.tsx` |
| Removed | `components/ui/form.tsx` |
| Removed | `components/ui/hover-card.tsx` |
| Removed | `components/ui/input-group.tsx` |
| Removed | `components/ui/input-otp.tsx` |
| Removed | `components/ui/input.tsx` |
| Removed | `components/ui/item.tsx` |
| Removed | `components/ui/kbd.tsx` |
| Removed | `components/ui/label.tsx` |
| Removed | `components/ui/marker.tsx` |
| Removed | `components/ui/menubar.tsx` |
| Removed | `components/ui/message-scroller.tsx` |
| Removed | `components/ui/message.tsx` |
| Removed | `components/ui/native-select.tsx` |
| Removed | `components/ui/navigation-menu.tsx` |
| Removed | `components/ui/pagination.tsx` |
| Removed | `components/ui/popover.tsx` |
| Removed | `components/ui/progress.tsx` |
| Removed | `components/ui/radio-group.tsx` |
| Removed | `components/ui/resizable.tsx` |
| Removed | `components/ui/scroll-area.tsx` |
| Removed | `components/ui/select.tsx` |
| Removed | `components/ui/separator.tsx` |
| Removed | `components/ui/sheet.tsx` |
| Removed | `components/ui/sidebar.tsx` |
| Removed | `components/ui/skeleton.tsx` |
| Removed | `components/ui/slider.tsx` |
| Removed | `components/ui/sonner.tsx` |
| Removed | `components/ui/spinner.tsx` |
| Removed | `components/ui/switch.tsx` |
| Removed | `components/ui/table.tsx` |
| Removed | `components/ui/tabs.tsx` |
| Removed | `components/ui/textarea.tsx` |
| Removed | `components/ui/toggle-group.tsx` |
| Removed | `components/ui/toggle.tsx` |
| Removed | `components/ui/tooltip.tsx` |
| Modified | `db/schema.ts` |
| Added | `drizzle/0003_owner_sessions.sql` |
| Added | `drizzle/0004_public_content_dates.sql` |
| Added | `drizzle/meta/0003_snapshot.json` |
| Added | `drizzle/meta/0004_snapshot.json` |
| Modified | `drizzle/meta/_journal.json` |
| Modified | `eslint.config.mjs` |
| Removed | `hooks/use-mobile.ts` |
| Modified | `lib/abuse.ts` |
| Removed | `lib/cloudflare-shim.ts` |
| Modified | `lib/dotted-models.ts` |
| Added | `lib/journey.ts` |
| Added | `lib/landing-content.ts` |
| Modified | `lib/meta.ts` |
| Removed | `lib/mongodb.ts` |
| Modified | `lib/notify.ts` |
| Added | `lib/owner-session.ts` |
| Modified | `lib/physical-halo.ts` |
| Added | `lib/scene-settings.ts` |
| Added | `lib/scroll-scene.ts` |
| Added | `lib/structured.ts` |
| Modified | `lib/studio-data.ts` |
| Added | `lib/studio-scene.ts` |
| Modified | `lib/studio-security.ts` |
| Removed | `lib/utils.ts` |
| Added | `next-env.d.ts` |
| Modified | `next.config.ts` |
| Modified | `package.json` |
| Modified | `pnpm-lock.yaml` |
| Modified | `pnpm-workspace.yaml` |
| Removed | `postcss.config.mjs` |
| Modified | `public/favicon.svg` |
| Added | `public/fonts/DM-Sans-LICENSE.txt` |
| Added | `public/fonts/IBM-Plex-Mono-LICENSE.txt` |
| Added | `public/fonts/dm-sans-latin.woff2` |
| Added | `public/fonts/ibm-plex-mono-latin.woff2` |
| Modified | `public/models/enchanted_crystal.glb` |
| Added | `public/studio-og.png` |
| Added | `public/texture.svg` |
| Modified | `scripts/connector-preview/protocol.mjs` |
| Added | `scripts/owner-hash.mjs` |
| Modified | `scripts/run-framework.mjs` |
| Modified | `scripts/vite/sites-vite-plugin.ts` |
| Modified | `tests/platform.mjs` |
| Added | `tests/showcase.test.mjs` |
| Modified | `tests/studio.test.mjs` |
| Removed | `vendor/shadcn-tailwind-4.13.0.LICENSE.md` |
| Removed | `vendor/shadcn-tailwind-4.13.0.css` |
| Added | `verification/audit-final.json` |
| Added | `verification/check-5-build.log` |
| Added | `verification/check-5-test.log` |
| Added | `verification/check-5-tsc.log` |
| Added | `verification/check-6-build.log` |
| Added | `verification/check-6-test.log` |
| Added | `verification/check-6-tsc.log` |
| Added | `verification/check-7-build.log` |
| Added | `verification/check-7-test.log` |
| Added | `verification/check-7-tsc.log` |
| Added | `verification/check-delivery-build.log` |
| Added | `verification/check-delivery-test.log` |
| Added | `verification/check-delivery-tsc.log` |
| Added | `verification/check-expressive-build.log` |
| Added | `verification/check-expressive-test.log` |
| Added | `verification/check-expressive-tsc.log` |
| Added | `verification/check-final-build.log` |
| Added | `verification/check-final-test.log` |
| Added | `verification/check-final-tsc.log` |
| Added | `verification/check-polish-original-build.log` |
| Added | `verification/check-polish-original-test.log` |
| Added | `verification/check-polish-original-tsc.log` |
| Added | `verification/check-refinement-tsc.log` |
| Added | `verification/lh-full.json` |
| Added | `verification/qa-final.json` |
| Modified | `vite.config.ts` |
| Added | `worker/home-cache.ts` |
| Modified | `worker/index.ts` |
| Added | `DELIVERY_REPORT.md` |
| Added | `verification/` logs and JSON results |
