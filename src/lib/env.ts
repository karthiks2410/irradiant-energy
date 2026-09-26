/** Deployment environment helpers (server and client safe). */

export const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

/** Placeholders for unconfirmed facts are shown only outside production. */
export const showPlaceholders = !isProduction;

/**
 * The one public origin. The bare domain (https://irradiantenergy.in) and the project's
 * *.vercel.app alias both redirect here, and a canonical URL must never name a host that
 * redirects. next.config.ts sends the Vercel alias here, and a Production build fails unless
 * NEXT_PUBLIC_SITE_URL is exactly this value (src/lib/env.server.ts).
 */
export const CANONICAL_ORIGIN = "https://www.irradiantenergy.in";

/**
 * Canonical site origin: NEXT_PUBLIC_SITE_URL, set in Production only, to CANONICAL_ORIGIN
 * (https://www.irradiantenergy.in). Elsewhere it falls back to the Vercel deployment URL, then
 * localhost.
 */
export const siteUrl = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercel =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      : process.env.NEXT_PUBLIC_VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
})();

/**
 * Indexing is on only in Production with the real domain configured (docs/discovery 11 §5.2), so
 * previews and local builds stay out of search. On its own this failed silently: Production once
 * served robots.txt `Disallow: /` and noindex for weeks because NEXT_PUBLIC_SITE_URL was never
 * set. A Production build now stops when it is missing or wrong (`assertProductionBuildEnv` in
 * src/lib/env.server.ts, called from next.config.ts).
 */
export const allowIndexing = isProduction && Boolean(process.env.NEXT_PUBLIC_SITE_URL);
