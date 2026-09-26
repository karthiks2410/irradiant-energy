# Irradiant Energy — website

Marketing site for Irradiant Energy (formerly Irradiant Energie), a rooftop-solar company in Bengaluru.
Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS v4, hosted on Vercel.
v1 covers rooftop solar for homes, housing societies and businesses only (`docs/decisions.md`, D-009).

## Requirements

Node 24 (`engines` in `package.json`) and npm.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build (type-checks as part of the build) |
| `npm start` | Serves the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (calculator, schemas) |
| `npx next typegen && npx tsc --noEmit` | Type-check without a build; this is what CI runs |
| `npm run build:share` | Re-render the link-preview images in `public/share/` (see below) |

## Environment variables

Copy `.env.example` to `.env.local`. Only the names are documented here; values are set in Vercel
(Project → Settings → Environment Variables) and never committed.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin (`https://www.irradiantenergy.in`, Production only). Setting it in production also switches search-engine indexing on. |
| `RESEND_API_KEY` | server | Transactional email for quote requests |
| `EMAIL_FROM` | server | Sender address |
| `LEAD_EMAIL` | server | Recipient of lead alerts |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | public | Search Console HTML-tag token; emits `<meta name="google-site-verification">` when set |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | public | Google Analytics 4 ID (`G-…`). Production only, and only after the visitor accepts analytics |
| `NEXT_PUBLIC_GA_ALLOW_NON_PRODUCTION` | public | `1` lets GA load in a local build for testing. Never set in Vercel |
| `LEAD_SHEET_URL` | server | Lead register: the Google Apps Script web-app URL (`integrations/google-sheet/README.md`). Optional; without it (or the token) enquiries are only emailed |
| `LEAD_SHEET_TOKEN` | server, secret | Shared token for the lead register; the same value as the script's `TOKEN` property. Production only |
| `LEAD_DRY_RUN` | server, local | `1` makes both lead forms succeed without sending any email (the register still gets its row). Ignored under `next start` and on Vercel |

## Google Search Console and Analytics

Everything is off until the values above are set, and each change needs a redeploy.

- **Search Console.** Prefer a *Domain* property verified by a DNS TXT record at the registrar: it
  covers `www`, the bare domain and both protocols, and needs no code. For a *URL-prefix* property,
  either set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (HTML tag) or put Google's `google….html` file in
  `public/` unchanged (HTML file; it is served from the site root). Then submit
  `https://www.irradiantenergy.in/sitemap.xml`. Crawling stays blocked (`robots.txt: Disallow: /`,
  `noindex` on every page) until `NEXT_PUBLIC_SITE_URL` is set in Production.
- **Google Analytics 4.** `src/lib/gtag.ts` holds the configuration and `src/components/analytics/`
  the consent-gated loader: no request goes to Google before the visitor accepts analytics, and
  withdrawing stops it and deletes the `_ga` cookies. In the GA4 web stream, turn **off** Enhanced
  measurement → Page views → "Page changes based on browser history events": the site sends each
  App Router page view itself, so leaving it on counts them twice. Also turn **off** "Outbound
  clicks" and "Form interactions": the site counts those clicks and submissions itself with
  allow-listed labels, while Google's versions would send the full link address — the WhatsApp
  link shown after an enquiry carries its reference in the prefilled message. Keep data retention
  at 2 months (the default); `/cookies` says so.
- **Events.** `track()` in `src/lib/gtag.ts` is the only way an event is sent, and it does nothing
  without consent. The events and their allowed parameter values are listed in `src/lib/events.ts`
  (generate_lead, email_estimate, click_call, click_whatsapp, click_email, open_quote,
  use_calculator, switch_language, click_social); every parameter is a closed list of labels, so a
  name, phone number, email address, PIN code or exact bill cannot reach Google. Page views and
  every event carry `content_group` (English / Kannada) and `page_type`; events carry the page's
  language as `site_language` (GA4 reserves `language` and would overwrite the browser-language
  field with it). Contact-link clicks are counted by one
  delegated listener (`src/lib/click-tracking.ts`); mark a link's area with
  `data-track-location="header|footer|bubble|contact|popup|result|page"`.
- **Lead source and lead register.** Each enquiry carries how the visitor found the site
  (`src/lib/leads/source.ts`, `first-touch.ts`): landing page, campaign tags and referring site with
  analytics consent, otherwise only the page it was sent from and the campaign tags in its address.
  It appears in the internal alert ("How they found us") and the lead register only — never in the
  customer's email, never in Google Analytics. The register is a Google Sheet written by an Apps
  Script (`integrations/google-sheet/`), fed after the alert email with a 4-second timeout that can
  never fail or slow an enquiry.
- **Canonical host.** `irradiant-energy.vercel.app` redirects permanently to
  `https://www.irradiantenergy.in` (`next.config.ts`); preview URLs are not affected.

`src/lib/env.ts` also reads Vercel's system variables (`NEXT_PUBLIC_VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_URL`,
`NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`) to derive the origin, placeholder display and indexing;
"Automatically expose System Environment Variables" must be on in the Vercel project.

## Where things live

- `docs/` — project brief, decision log (`decisions.md`), discovery report, content inventory (every
  business fact with its status), architecture. `docs/discovery/` holds the source notes.
- `src/content/site.ts` — the single source of business facts (contacts, navigation). Unconfirmed
  facts show a yellow placeholder outside production and nothing in production.
- `src/app/globals.css` — brand tokens (colours, type scale, layout utilities).
- `src/components/` — `brand` (logo), `layout` (header, footer), `ui`, `seo` (JSON-LD).
- `src/lib/seo.ts` — `pageMetadata()`, the per-page metadata helper every page uses.
- `src/lib/share-images.ts` + `public/share/<locale>/<page>.jpg` — the link-preview image WhatsApp,
  LinkedIn, X and Facebook show for each page, in each language. They are committed files rendered in
  Chromium by `npm run build:share` (Satori, behind `next/og`, cannot shape Kannada). Re-run it after
  changing a page headline, a project photo or the logo; `npm test` fails if a card is missing, not
  1200×630 or over 300 KB.
- `AGENTS.md` — this Next.js version differs from older documentation; read the bundled guides in
  `node_modules/next/dist/docs/` before changing framework code.

## CI

`.github/workflows/ci.yml` runs lint, route typegen + `tsc`, the unit tests and a production build on every
push and pull request. Dependabot (`.github/dependabot.yml`) proposes npm and GitHub Actions updates weekly.
