# Aromal Mihraj — Private Tutoring

Single-page static site. No framework. **~97KB to first paint over the wire**, **~285KB full-page cold load** (Calendly excluded — that's lazy). Full SEO infrastructure, structured data for AI search citation.

## Stack

- Static HTML + ~150 lines of vanilla JS (minified to 4.9KB)
- CSS inlined in `<style>` block (critical-path render, one HTTP round-trip)
- **Self-hosted fonts** (Latin subset only, woff2). Fraunces, Instrument Serif, JetBrains Mono. No Google Fonts CDN.
- **Responsive images** — AVIF + WebP + JPEG with `<picture>` and srcset (3 sizes per format)
- **Calendly** embed (lazy-loaded on intersection — saves ~250KB on first paint)
- **HTTP/2 Early Hints** via Vercel `Link:` headers (preloads LCP fonts before HTML arrives)
- Hosted on Vercel

## Performance budget (verify with Lighthouse after first deploy)

| Metric                          | Target | Why |
|---------------------------------|--------|-----|
| Largest Contentful Paint (LCP)  | <1.0s  | Fonts preloaded, hero h1 in static HTML, no JS render block |
| Cumulative Layout Shift (CLS)   | <0.05  | `Fraunces Fallback` @font-face metric overrides prevent swap shift |
| Interaction to Next Paint (INP) | <100ms | All listeners passive + rAF; accordions are class toggles |
| Total Blocking Time (TBT)       | <100ms | No render-blocking JS, defer on app.min.js, lazy Calendly |
| Lighthouse Performance          | ≥95    | All of the above |
| Lighthouse SEO                  | 100    | All meta + JSON-LD `@graph` of 6 nodes |
| Lighthouse Accessibility        | ≥95    | Skip-link, ARIA labels, focus-visible, semantic landmarks |
| Lighthouse Best Practices       | 100    | Strict CSP, HSTS, all modern image formats |
| HTML payload (brotli)           | <16KB  | Minified JSON-LD, no Google Fonts CSS round-trip |
| Total cold visit (no Calendly)  | <300KB | AVIF portrait, woff2 fonts, no framework |

## Local development

```bash
npm run dev      # → http://localhost:3000
```

The `dev` script uses `npx serve` — no install required.

## Build / regenerate

After editing `app.js`, regenerate the minified version:

```bash
npm run build:js   # writes app.min.js (referenced by index.html)
```

After replacing the source portrait, rebuild image variants:

```bash
npm run build:images path/to/new-portrait.jpg
# Generates AVIF/WebP/JPEG at 3 sizes + favicon set + og-image
# Adjust the sips --cropOffset values in scripts/build-images.sh if subject moves
```

After changing font families/weights, refetch the woff2 files:

```bash
npm run build:fonts
# Updates assets/fonts/*.woff2; manually update the @font-face block in index.html if URLs/ranges changed
```

`npm run build` runs `build:js` + `build:images` together.

## Deployment

### One-time setup

1. Buy the domain `aromaltutoring.com` (or chosen alternative — see "Domain swap" below).
2. Push this repo to GitHub.
3. Go to https://vercel.com/new, import the repo, accept defaults.
4. In Vercel project settings → Domains → add `aromaltutoring.com` and `www.aromaltutoring.com` (set www to redirect to apex).
5. Update DNS at your registrar per Vercel's instructions (`A 76.76.21.21` for apex, `CNAME cname.vercel-dns.com` for www).

### Subsequent deploys

Push to `main` → auto-deploys to production. Or run:

```bash
npm run deploy   # production
npm run preview  # preview deploy
```

## Domain swap

The placeholder domain throughout the site is `aromaltutoring.com`. If you use a different domain, update **every occurrence** in:

- `index.html` — `<link rel="canonical">`, all `og:` and `twitter:` meta tags, all `@id` and `url` fields in the JSON-LD `@graph`
- `robots.txt` — `Sitemap:` and `Host:` lines
- `sitemap.xml` — every `<loc>` and `<image:loc>`
- `llms.txt` — `Site:` and `Booking:` lines
- `humans.txt` — `Site:` line
- `.well-known/security.txt` — `Canonical:` line

A single search-replace for `aromaltutoring.com` → `your-domain.com` covers all of them.

## SEO checklist after first deploy

These are one-time setup steps that have to happen *after* the site is live on its real domain:

### Required (do these on day 1)

- [ ] **Google Search Console** — https://search.google.com/search-console — add property, verify via meta tag (uncomment the `<meta name="google-site-verification">` line in `index.html` and replace the token), then submit `https://aromaltutoring.com/sitemap.xml`.
- [ ] **Bing Webmaster Tools** — https://www.bing.com/webmasters — repeat for `<meta name="msvalidate.01">`. Bing also powers DuckDuckGo, Yahoo, and ChatGPT search results.
- [ ] **Google Business Profile** — https://www.google.com/business/ — create a Service-area business profile pinned to Brampton, ON. Critical for local map-pack ranking on "Brampton tutor" queries. Requires a real address (can be hidden) and phone verification.
- [ ] **Bing Places** — https://www.bingplaces.com/ — same idea for Bing/ChatGPT.

### High-leverage (do these in week 1)

- [ ] **Google Analytics 4** — create a property at https://analytics.google.com, then add the gtag snippet just before `</head>` in `index.html`. Or use **Plausible** (https://plausible.io) for cookie-free privacy-friendly analytics — no consent banner needed.
- [ ] **OG image polish** — `assets/og-image.jpg` is currently a sips crop of the portrait. For better social sharing, replace with a 1200×630 designed card (text overlay: "Aromal Mihraj — Private Tutor", credentials, sienna accent). Figma or Canva works.
- [ ] **Real reviews** — once you have 3+ written student/parent reviews with permission, add them to `index.html` (replace anonymized initials with first names + last initial), and add a `Review` schema array inside the JSON-LD `@graph`. Reviews unlock star ratings in SERPs.
- [ ] **Backlinks** — get linked from your school's website, a local Brampton tutoring directory, your Calendly profile bio, your LinkedIn (if any), and any media that's covered NSS/Model UN wins. Domain authority comes from *other sites linking to you*.

### Optional (later — only if growth stalls)

- [ ] Per-subject sub-pages (`/sat-tutoring-brampton`, `/ap-calculus-tutor-brampton`, `/mcv4u-tutor-brampton`) — each with 600+ words of content targeting that exact query. This is the highest-impact growth lever after the core site is indexed.
- [ ] Blog — long-form posts like "How to score 1500+ on the digital SAT in 8 weeks" with internal links back to `/`. Slow-burn but compounding.
- [ ] Schema for `aggregateRating` once you have real reviews collected.

## What's where

```
index.html              — full single-page site, all sections inline
app.js                  — vanilla JS for blackboard, stats, accordions, carousel, lazy Calendly
assets/                 — portrait + favicon set + OG image
favicon.svg             — handcrafted SVG favicon (sienna "A" on paper)
robots.txt              — allows all major + AI crawlers
sitemap.xml             — single URL with image references
llms.txt                — markdown summary for ChatGPT/Perplexity/Gemini citation
humans.txt              — credits
manifest.webmanifest    — PWA manifest (for "add to home screen")
404.html                — themed 404
.well-known/security.txt — vulnerability disclosure contact
vercel.json             — security headers, caching, Link preload (Early Hints), redirects
package.json            — dev + build + deploy scripts
scripts/build-images.sh — re-encode portrait → AVIF/WebP/JPEG + favicons + og-image
scripts/build-fonts.sh  — refetch self-hosted Latin woff2 from Google Fonts
assets/fonts/           — 5 self-hosted woff2 files (Fraunces var, Instrument Serif r+i, JetBrains Mono var)
assets/portrait-{400,600,800}.{avif,webp} — responsive portrait variants
```

## Updating content

All copy lives in `index.html` — open it, search for the text, edit, save. The structured data (JSON-LD `@graph` near the top of `<head>`) **must stay in sync** with the visible content — for example, if you raise prices, update both:
- The "$25/hour" mentions in the hero, FAQ, and "Begin" section
- The four `"price": "25"` values in the `OfferCatalog` JSON-LD

When you add a real review, update both:
- The `<article class="t-card">` block in the `#voices` section
- (Optional but recommended) Add a `Review` entry to the JSON-LD graph for SERP star ratings

## Performance verification

Verify with PageSpeed Insights after first deploy: https://pagespeed.web.dev/

Target the budgets in the table at the top of this README. Common things to check if a metric regresses:

- **LCP regressed** — confirm the two `<link rel="preload">` font tags in `index.html` still match the actual font filenames in `/assets/fonts/`. Check the Vercel `Link:` headers in `vercel.json` for the `/` route.
- **CLS regressed** — verify the `Fraunces Fallback` @font-face metric overrides match Fraunces' real metrics. If Fraunces' OpenType metadata changes, recompute via https://screenspan.net/fallback.
- **Bundle bloated** — re-run `npm run build:js`. Confirm `index.html` references `/app.min.js`, not `/app.js`.
- **Wrong image served** — DevTools → Network → filter "img". You should see one of `portrait-{400,600,800}.{avif|webp|jpg}` based on viewport + browser support.

## Why this stack

- **No framework.** A single tutor's brochure site doesn't need React. Static HTML is faster to load, faster to maintain, and gives crawlers the full content on the first byte — which is the foundation of SEO.
- **One build step (terser only).** `app.js` is hand-edited; `app.min.js` is the shipped artifact. Re-run `npm run build:js` after changes. No transpilation, no source maps, no tooling drift.
- **Inlined CSS.** Critical CSS in the document means first paint happens in one HTTP round-trip after the HTML arrives.
- **Self-hosted fonts.** Eliminates Google Fonts CDN: no third-party connection setup, no extra CSS round-trip, no GDPR concern, immutable cache control via Vercel headers.
- **Lazy Calendly.** The booking widget is ~250KB of JS. Loading it only when the user scrolls near the booking section halves the initial JS payload.
- **AVIF + WebP + JPEG.** AVIF cuts the portrait from 264KB → ~55KB at the 600px size most users hit. Old browsers still get a JPEG fallback via `<picture>`.
- **content-visibility: auto.** Below-fold sections skip layout/paint until scrolled into view. Combined with `contain-intrinsic-size`, no scrollbar jump.
- **HTTP/2 Early Hints.** Vercel sends a `103 Early Hints` response with `Link: rel=preload` for the LCP fonts before the HTML is even generated, so the browser starts the font fetch in parallel with the HTML.
- **JSON-LD over microdata.** Structured data is in a single minified `<script>` block, the format Google + AI search engines prefer.
- **Strict CSP.** `default-src 'self'`, scripts only from self + Calendly, no inline scripts, no eval. Prevents XSS even if user-generated content is ever introduced.
