/** Deployment environment helpers (server and client safe). */

export const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

/** Placeholders for unconfirmed facts are shown only outside production. */
export const showPlaceholders = !isProduction;

/**
 * Canonical site origin. Set NEXT_PUBLIC_SITE_URL once the domain is live
 * (https://www.irradiantenergy.in, Production only); falls back to the Vercel deployment URL, then localhost.
 */
export const siteUrl = (() => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const vercel =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
      ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      : process.env.NEXT_PUBLIC_VERCEL_URL;
  return vercel ? `https://${vercel}` : "http://localhost:3000";
})();

/** Indexing stays off until the real domain is configured (docs/discovery 11 §5.2). */
export const allowIndexing = isProduction && Boolean(process.env.NEXT_PUBLIC_SITE_URL);
