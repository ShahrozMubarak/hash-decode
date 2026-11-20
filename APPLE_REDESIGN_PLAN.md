<USER_REQUEST>
# Hash Decode: Apple-Style Redesign Plan (for Antigravity)

Goal: make hashdecode.com feel like an Apple product page (white, calm, big type, big rounded cards, lots of space) while **keeping the 3D robot**.

---

## HOW TO USE THIS FILE

1. Read this whole file first.
2. Do **ONE stage at a time**. After each stage: list files changed, list what was removed, say what I should check visually, then **STOP and wait for me to say "next"**.
3. Paste this to start each stage:

> Read APPLE_REDESIGN_PLAN.md fully. Do ONLY Stage N. Follow the Global Rules. When done, list changed files, removed items, and what I should check. Then stop.

---

## GLOBAL RULES (apply to every stage)

1. Work on a git branch called `apple-redesign`. Commit after each stage: `stage-N: short description`. If a stage breaks something, revert that commit only.
2. **Presentation layer only.** Do NOT touch: API routes, database/MongoDB, auth/admin login, env vars, form submission logic, bot protection, SEO/meta tags, sitemap, Google Search Console files, analytics, Vercel config.
3. **Do NOT modify the 3D robot**: model, materials, camera, controls, animation logic. Only allowed: make its canvas background transparent and style its wrapper (Stage 6).
4. Keep every existing route, link, form field name, element ID, and aria-label.
5. No new heavy libraries. Only new font allowed: Inter.
6. After Stage 2, **no hard-coded colors, radii, or font sizes in components.** Use the CSS variables below.
7. After each stage: build passes, zero console errors, and it looks right at 1440px, 1024px, 768px, and 390px widths.
8. If something is unclear or risky, ask me first. Do not guess.
9. Never delete files or unused code unless the stage says so. List candidates instead and ask.

---

## DESIGN SYSTEM (single source of truth)

### Colors

```css
:root {
  /* backgrounds */
  --bg: #ffffff;
  --bg-alt: #f5f5f7;
  --bg-dark: #000000;

  /* cards */
  --card-on-white: #f5f5f7;   /* card sitting on a white section */
  --card-on-grey: #ffffff;    /* card sitting on a grey section */
  --card-dark: #1d1d1f;       /* card sitting on a black section */
  --card-navy: #0b1f3f;       /* brand accent card (use sparingly) */
  --card-tint: #eaf2ff;       /* soft blue accent card (use sparingly) */

  /* text */
  --text: #1d1d1f;
  --text-2: #6e6e73;          /* secondary text on light */
  --text-on-dark: #f5f5f7;
  --text-2-on-dark: #a1a1a6;

  /* single accent */
  --accent: #0071e3;
  --accent-hover: #0077ed;
  --accent-on-dark: #2997ff;

  --hairline: rgba(0, 0, 0, 0.08);
  --hairline-on-dark: rgba(255, 255, 255, 0.12);
}
```

**Red is removed from the site completely** (eyebrow dashes, CTA buttons, Join button, scroll dots). One accent only: blue.

### Shape, space, type

```css
:root {
  --radius-card: 28px;
  --radius-card-lg: 32px;
  --radius-input: 12px;
  --radius-pill: 980px;

  --container: 1080px;
  --section-pad: clamp(80px, 12vw, 160px);
  --card-gap: 20px;
  --card-pad: 40px 32px;

  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif;
}
```

| Element | Size | Weight | Line height | Letter spacing |
|---|---|---|---|---|
| Hero h1 | clamp(2.5rem, 6vw, 5rem) | 600 | 1.05 | -0.03em |
| Section h2 | clamp(2rem, 4.5vw, 3.5rem) | 600 | 1.1 | -0.025em |
| Card title | 21-24px | 600 | 1.2 | -0.01em |
| Body / sub text | 17-20px | 400 | 1.47 | -0.01em |
| Card text | 15-17px | 400 | 1.47 | -0.01em |
| Small / footer | 12-14px | 400 | 1.4 | 0 |

### Rules that make it look "Apple"

- **No borders and no shadows on cards.** Cards are just flat color blocks with big rounded corners.
- Card color is different from the section behind it (that is what makes the card visible).
- **Two-tone headlines:** dark text with ONE accent word, in the same font (e.g. "Tested before **launch.**").
- Section headers are centered. Subtext is centered, max-width about 640px, grey.
- One idea per section. Lots of empty space.
- Max one accent-colored thing per card.

---

## SECTION MAP (backgrounds + card colors)

Sections alternate so each one feels like its own "screen":

| # | Section | Section bg | Cards |
|---|---|---|---|
| 1 | Hero | white `--bg` | none (robot only) |
| 2 | Capabilities | grey `--bg-alt` | white `--card-on-grey` |
| 3 | Security assurance | white `--bg` | grey `--card-on-white` |
| 4 | Studio concepts (projects) | black `--bg-dark` | dark `--card-dark` |
| 5 | Team | grey `--bg-alt` | black / white / soft blue / navy (see Stage 9) |
| 6 | Contact / brief | white `--bg` | form card `--card-on-white` |
| 7 | Footer | grey `--bg-alt` | none |

---

## COPY DECK (simpler text)

Replace long text with short plain sentences. Keep it easy to read.

**Hero**
- Eyebrow: `Secure software studio` (plain grey text, no pill)
- H1: `Build it. Break it. Secure.` (last word in accent)
- Sub: `Custom software and security testing for businesses.`

**Capabilities**
- H2: `Built to perform.` (accent: "perform.")
- Sub: `Custom software, web platforms, and secure APIs, built around how your business works.`
- Card 1, Custom Web Platforms: `Fast, modern web apps built end to end.`
- Card 2, Internal Tools & APIs: `Backends, automations, and admin tools that scale.`
- Card 3, Security Audits & Hardening: `Penetration tests and fixes, before you launch.`

**Security**
- H2: `Tested before launch.` (accent: "launch.")
- Sub: `Penetration testing, code review, and a clear security sign-off.`
- 1 Scope: `We map every entry point, API route, and data flow.`
- 2 Test: `Manual and automated testing against real exploits.`
- 3 Verify: `We retest every fix and give you a sign-off report.`
- Button: `Request an audit`

**Projects**
- H2: `Studio concepts.` (accent: "concepts.")
- Sub: `Working products and tools we have designed and built.`
- Project: title `Foolish Arc`, line `Online storefront for a clothing brand.`, tags as plain text `Client project · Clothing`, link `View project`

**Team**
- H2: `Meet the team.` (accent: "team.")
- Sub: `Developers, marketers, and builders working as one studio.`
- Fix capitalization: names in Title Case, "Head" with capital H.

**Contact**
- H2: `What are you working on?` (accent: "working on?")
- Sub: `Tell us what you need, who it is for, and when you want it done.`

**Footer newsletter**
- Title: `Stay in the loop.` Sub: `Occasional notes on engineering and security.` Button: `Subscribe`

---

# STAGES

---

## STAGE 0: Analyze (READ ONLY, no code changes)

**Goal:** understand how the site works before touching anything.

**Do:**
- Create branch `apple-redesign`.
- Report in chat: framework and build tool; how styling is done (Tailwind, CSS modules, global CSS, styled-components); where global theme/CSS lives; list of pages/routes; homepage sections in order with their component file names.
- Find and report: where the **3D robot** lives (component, canvas, library), where the small **Hash Bot** (bubble + mini robot) lives, the navbar, footer, shared card and button components, the scroll dots, the particle background, the tech-name ticker, the grid background.
- List every hard-coded color, font family, shadow, and animation library used (GSAP, Framer Motion, Lenis, etc.).
- List any risks (things that look fragile if restyled).

**Don't:** change any file.

**Done when:** I have read your report and said "next".

---

## STAGE 1: Typography

**Goal:** Apple-like type only. No color, layout, or content changes.

**Do:**
- Load **Inter** (400, 500, 600, 700) with `display=swap`. Set `--font-sans` from the Design System on `html`, `body`, buttons, inputs, textareas, selects.
- Apply the type table: hero h1, section h2, card titles, body, small text. Weight 600 for headings (reduce any heavier weights), tight letter-spacing on big headings, body 17px / 1.47.
- Add `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility;`
- Nav links 12-14px weight 400; buttons weight 500, no uppercase, no wide tracking.
- Remove the pixel/tech font on the word "Secure" and any other mixed fonts. One font family only.
- Remove old conflicting font imports and `font-family` declarations.

**Don't:** touch colors, spacing, layout, content, robot.

**Done when:** every text on the site uses one font family and headings look lighter and tighter than before. (If I already did this stage, only verify it and fix leftovers.)

---

## STAGE 2: Design tokens + white background

**Goal:** one color system; page goes white.

**Do:**
- Add all variables from the Design System in one global file.
- Set page background to `--bg`. **Remove** the grey gradient and the faint grid-line background pattern.
- Apply the Section Map backgrounds to each homepage section (sections alternate white / grey / black as in the map). Do not restyle cards yet; just make section backgrounds and text colors readable (dark text on light, light text on dark).
- Replace hard-coded colors in components with variables where easy. Where a component is complex, list it for later stages.
- Fix low-contrast text (e.g. light grey subtext on grey, "Tell us who it's for..." in the contact section).

**Don't:** change layout, content, robot, nav shape, card shapes.

**Done when:** background is white/grey/black per the map and all text is readable.

---

## STAGE 3: Declutter and flatten

**Goal:** remove everything that makes the site look busy or cheap.

**Remove:**
- Floating particle/dots background effect
- The big faded `HASH DECODE` watermark text behind the robot
- The scrolling tech-name ticker strip (Cloudflare, React, Next.js, Node, Python, TypeScript). Remove the marquee animation; do not replace it.
- The faint grid background (if not already gone)
- Glow/neon box-shadows and glowing borders everywhere
- The typing-cursor animation on the hero headline (make the headline static)
- Red dashes before eyebrow labels (CAPABILITIES, SECURITY ASSURANCE, etc.)
- The horizontal connecting line that crosses the three process cards (Scope / Test / Verify)
- The ghost "HASH DECODE" text next to the logo in the footer

**Simplify:**
- Eyebrow labels: plain small text, sentence case, `--text-2`, 14px, weight 600, no uppercase, no letter-spacing, no dash.
- The top badge "SECURE SOFTWARE STUDIO": plain text, no pill, no dots, no border.
- Scroll-position dots on the right: tiny, monochrome (active = `--text`, inactive = light grey). No red.
- Shadows: none on cards and buttons.

**Don't:** touch the robot, content, layout structure.

**Done when:** no particles, no glows, no red, no watermark, no ticker, no grid.

---

## STAGE 4: Buttons and links (one system)

**Goal:** every button and link looks like it belongs to the same family.

**Do:**
- **Primary button:** pill (`--radius-pill`), background `--accent`, white text, weight 500, padding about 12px 22px, **no arrow icon, no inner circle**. Hover: `--accent-hover`. Used for: Start a project, Request an audit, Send project brief, Subscribe.
- **Text link:** `--accent` color, text followed by a `›` (e.g. "Learn more ›"). Replace all `↗` arrows. Hover: underline.
- **On dark backgrounds:** primary button = white background with black text; links use `--accent-on-dark`.
- Replace all navy and red buttons ("Meet the team" navy, "Request an audit" red, "Send project brief" red, "Join" red) with the primary style.
- Remove pill-style outlined buttons around WhatsApp links; they become text links.
- Focus states: visible 2px accent outline offset 2px.

**Don't:** change link destinations or form behavior.

**Done when:** only two button looks exist on the whole site: primary pill and text link.

---

## STAGE 5: Navbar

**Goal:** thin, flat, translucent Apple-style bar.

**Do:**
- Full-width fixed bar, height 48-52px. Background `rgba(255,255,255,0.8)` with `backdrop-filter: saturate(180%) blur(20px)`, bottom hairline `1px solid var(--hairline)`.
- Remove the heavy navy pill, glow border, and the **icons** inside nav links. Text only.
- Layout: logo (left), Work / Services / About / Contact (centered, 13px, weight 400, `--text`, slightly lighter on hover), small primary pill "Get in touch" (right, 13px, no arrow icon).
- Keep the pause-animation button but restyle it: small 28px circle, thin grey outline, grey icon.
- Over the black Projects section the bar stays light (translucent white blur is fine).
- Mobile: logo + menu button; menu opens as a clean full-width sheet, same colors.

**Don't:** change nav links' destinations or routes.

**Done when:** nav is flat and thin, with no icons and no shadow.

---

## STAGE 6: Hero (keep the robot)

**Goal:** centered Apple-style hero with the robot as the product shot.

**Do:**
- Layout (desktop): centered column in this order: eyebrow text, H1, sub line, robot, buttons.
- H1: `Build it. Break it. Secure.` Static, one or two lines, last word `--accent`. Use the hero h1 size from the table.
- Robot: centered **below** the text, height about 50vh. Make its canvas background **transparent** so it sits on the page. Remove the old "Start a project" floating pill at bottom right; the CTA becomes a centered primary button below the robot, with a text link `Explore the studio ›` next to it.
- Add a soft ground shadow under the robot: a CSS radial-gradient ellipse (`rgba(0,0,0,0.12)`, blurred), not a heavy dark pill.
- Hero background: white with a very subtle radial gradient of `--bg-alt` behind the robot so the silver model has contrast.
- Robot must stay interactive (mouse/touch). Do not change model, materials, lights, camera, or controls. If the robot looks washed out on white, **tell me with a screenshot and do not change lighting yet.**
- Mobile: keep the 3D robot (no still image), height about 42vh, h1 scales down.

**Don't:** modify robot internals, change the 3D library, or alter its load logic.

**Done when:** hero is centered, robot is clearly visible on white, no particles/watermark, only one CTA.

---

## STAGE 7: Section headers + Capabilities + Security cards

**Goal:** centered headers and Apple-style cards for the first two content sections.

**Section header pattern (use everywhere):**
- Centered. Optional plain eyebrow, then H2 (two-tone, one accent word), then a centered sub line (max-width 640px, 20px, `--text-2`).
- Padding: `--section-pad` top and bottom. Container max-width `--container`.
- Remove right-aligned links like "Explore services"; place `Explore services ›` as a text link centered under the cards.

**Capabilities (grey section, white cards):**
- 3-column grid, gap 20px, cards `--card-on-grey`, radius 28px, padding `--card-pad`, equal heights, no border, no shadow.
- Icon: bare line icon, 32px, `--accent`, **no tinted square behind it**.
- Title 24px/600, text 17px `--text-2`, `Learn more ›` link at the bottom of the card.
- Use the short copy from the Copy Deck.

**Security (white section, grey cards):**
- 3 cards `--card-on-white`, same sizes as above.
- Replace the three icons with large numerals **1, 2, 3** (48px, weight 600, `--accent`).
- Centered primary button `Request an audit` below the cards.

**Don't:** change links, routes, or section order.

**Done when:** both sections look like Apple feature cards: flat, rounded, quiet.

---

## STAGE 8: Projects (Studio concepts)

**Goal:** one big dramatic project card on black.

**Do:**
- Section bg `--bg-dark`. H2 in white with accent word in `--accent-on-dark`. Sub in `--text-2-on-dark`.
- Project card: full container width, `--card-dark`, radius 32px, padding clamp(32px, 5vw, 64px), content centered.
- Inside the card, top to bottom: title `Foolish Arc` (32px/600), one line description, then the project screenshot centered at max-width about 880px with radius 16px (this is the **only** place a soft shadow is allowed: `0 20px 60px rgba(0,0,0,0.4)`).
- Tags (`Client project`, `Clothing`) become plain grey text on one line, no pills. Title no longer ALL CAPS and no brackets.
- Link `View project ›` in `--accent-on-dark`.
- More projects later = more cards stacked vertically, same style.

**Don't:** change the screenshot file or its link.

**Done when:** the section is one clean dark card with the screenshot as the hero of the card.

---

## STAGE 9: Team cards

**Goal:** four small, clean, colorful cards with small photos.

**Layout:**
- Section bg `--bg-alt`. Container `--container`. Grid: 4 columns on desktop, 2 columns under 1024px, 1 column under 600px. Gap 20px.
- Card: radius 28px, padding 32px 24px, min-height about 260px, centered content, no border, no shadow.
- **Photo: small.** 88px circle, `object-fit: cover; object-position: center 20%`, same size and same crop for all four. No border, no shadow. 20px gap below photo.
- Name: 19px / 600. Role: 14px / 1.4, secondary color. Max 2 lines for role.

**Card colors (text color flips to match):**

| Person | Card bg | Name color | Role color |
|---|---|---|---|
| Fawad Feroz, Founder and Sales Head | `#000000` | `--text-on-dark` | `--text-2-on-dark` |
| Junaid Jawaid, Editor and Marketing Head | `--card-on-grey` (white) | `--text` | `--text-2` |
| Shahmeer Hasan, Automation and Digital Marketing Head | `--card-tint` | `--text` | `--text-2` |
| Shahroz Mubarak, Development Director | `--card-navy` | `--text-on-dark` | `--text-2-on-dark` |

**Other:**
- Fix capitalization in names and roles.
- "Meet the team" navy button becomes a centered primary pill under the grid (or a text link `Meet the team ›`).
- If the four photos have different backgrounds or lighting, tell me; do not edit the image files.

**Don't:** change the photo files, names' spelling, or link targets.

**Done when:** four equal cards, small photos, four different surface colors, readable text on each.

---

## STAGE 10: Contact + form

**Goal:** clean two-column contact section; form still works exactly as before.

**Do:**
- Section bg `--bg` (white). Desktop: two columns. Left: header (left-aligned is fine here) + contact info. Right: form card. Mobile: stacked.
- Contact info as a tidy list: small grey label, then 17px value. **Fix the missing spaces** ("Email: hashdecodeofficial@gmail.com", "WhatsApp: 0300 1237124 · 0321 4866916", "HQ: Johar Town, Lahore, Pakistan"). Email and numbers are text links (`--accent`). Replace the two stacked WhatsApp pills with two text links `WhatsApp 0300 1237124 ›` and `WhatsApp 0321 4866916 ›`.
- Form card: `--card-on-white`, radius 28px, padding 32px, no border, no shadow.
- Inputs/selects/textarea: background `--bg` (white) on the grey card, no border (or 1px `--hairline`), radius 12px, height 48px, 17px text, labels 14px/600. Focus: 2px accent outline.
- Submit: full-width primary pill. Privacy note: 12px grey.
- **Hash Bot** bubble: white, radius 18px, soft shadow `0 4px 24px rgba(0,0,0,0.08)`. Make sure the mini robot below it is **never cut off** by the footer (add bottom padding so it ends at least 40px above the footer).

**Don't:** change form field names, validation, submit endpoint, or bot protection.

**Done when:** submitting the form still works, text is readable, nothing is cut off.

---

## STAGE 11: Footer

**Goal:** Apple-style quiet footer.

**Do:**
- Bg `--bg-alt`, replace the dark navy. Top hairline.
- Columns (Capabilities, Studio, Contact): headings 12px/600 `--text` (sentence case, not uppercase tracked), links 12px `--text-2`, hover underline. Compact vertical spacing (about 10px between links).
- Newsletter: `Stay in the loop.` + short sub line, pill input (white, no border, radius 980px) + primary `Subscribe` pill. Keep the existing submit logic.
- Bottom row separated by a hairline: `© 2026 Hash Decode. Developed by ...` in 12px grey; `Privacy & Security` as text link; `Back to top` as a small text link (no pill).
- Logo visible on light bg; remove the invisible ghost text.

**Don't:** change links or the credit text.

**Done when:** footer is light, small-text, and has no red or navy.

---

## STAGE 12: Motion, responsive, final QA

**Goal:** subtle Apple-like motion and no broken screens.

**Motion:**
- Scroll reveal on headings and cards: fade + translateY(24px → 0), 0.8s, `cubic-bezier(0.28, 0.11, 0.32, 1)`, triggered once with IntersectionObserver, small stagger (60-80ms) between cards.
- Card hover: very subtle `transform: scale(1.01)`, no shadow.
- Respect `prefers-reduced-motion` (no animation at all).
- No parallax, no cursor effects, no new animation libraries.
- *Optional (ask me before doing):* smooth background-color transition between sections instead of hard edges.

**Responsive + performance:**
- Check 1440 / 1024 / 768 / 390: no horizontal scroll, no overlapping text, cards stack cleanly, robot visible.
- Images below the fold: `loading="lazy"` with width/height set. Keep the robot and hero assets eager.
- Contrast check: all text at least 4.5:1.

**Cleanup:**
- List unused CSS, components, and assets that are now dead (particles, ticker, grid, old fonts). **Do not delete; list them and ask me.**

**Final QA checklist (report each as pass/fail):**
- [ ] One font family only
- [ ] No red anywhere
- [ ] One accent color (blue)
- [ ] No card borders or shadows (except the Projects screenshot)
- [ ] Only two button styles (primary pill, text link)
- [ ] Robot loads, is interactive, works on mobile
- [ ] Contact form submits successfully
- [ ] All nav links and footer links work
- [ ] No console errors, build passes
- [ ] Section backgrounds follow the Section Map

---

## ROLLBACK

If any stage looks wrong: `git revert` that stage's commit, tell me what was wrong, and redo only that stage. Never stack a new stage on top of a broken one.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-11-20T16:44:53+05:00.

The user's current state is as follows:
Active Document: /Users/macbookpro/Music/projects/Hash Decode/hash-decode-studio/app/api/session/route.ts (LANGUAGE_UNSPECIFIED)
Cursor is on line: 35
Other open documents:
- /Users/macbookpro/Music/projects/Hash Decode/hash-decode-studio/node_modules/.pnpm/tr46@5.1.1/node_modules/tr46/index.js (LANGUAGE_UNSPECIFIED)
- /Users/macbookpro/Music/projects/Hash Decode/hash-decode-studio/components/studio/SitePreloader.tsx (LANGUAGE_UNSPECIFIED)
- /Users/macbookpro/Music/projects/Hash Decode/hash-decode-studio/components/studio/SceneBoundary.tsx (LANGUAGE_UNSPECIFIED)
- /Users/macbookpro/Music/projects/Hash Decode/hash-decode-studio/components/studio/SceneSurface.tsx (LANGUAGE_UNSPECIFIED)
- /Users/macbookpro/Music/projects/Hash Decode/hash-decode-studio/eslint.config.mjs (LANGUAGE_UNSPECIFIED)
</ADDITIONAL_METADATA>