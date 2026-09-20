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

## Environment variables

Copy `.env.example` to `.env.local`. Only the names are documented here; values are set in Vercel
(Project → Settings → Environment Variables) and never committed.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical origin (`https://irradiantenergy.in`). Setting it in production also switches search-engine indexing on. |
| `RESEND_API_KEY` | server | Transactional email for quote requests |
| `EMAIL_FROM` | server | Sender address |
| `LEAD_EMAIL` | server | Recipient of lead alerts |

`src/lib/env.ts` also reads Vercel's system variables (`NEXT_PUBLIC_VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_URL`,
`NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`) to derive the origin, placeholder display and indexing;
"Automatically expose System Environment Variables" must be on in the Vercel project.

## Where things live

- `docs/` — project brief, decision log (`decisions.md`), discovery report, content inventory (every
  business fact with its status), architecture. `docs/discovery/` holds the source notes.
- `src/content/site.ts` — the single source of business facts (contacts, navigation). Unconfirmed
  facts show a yellow placeholder outside production and nothing in production.
- `src/app/globals.css` — brand tokens (colours, type scale, layout utilities).
- `src/components/` — `brand` (logo), `layout` (header, footer), `ui`, `seo` (JSON-LD, social image).
- `src/lib/seo.ts` — `pageMetadata()`, the per-page metadata helper every page uses.
- `AGENTS.md` — this Next.js version differs from older documentation; read the bundled guides in
  `node_modules/next/dist/docs/` before changing framework code.

## CI

`.github/workflows/ci.yml` runs lint, route typegen + `tsc`, the unit tests and a production build on every
push and pull request. Dependabot (`.github/dependabot.yml`) proposes npm and GitHub Actions updates weekly.
