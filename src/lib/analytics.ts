/**
 * Google configuration read from the environment: the Search Console verification token and the
 * Google Analytics 4 measurement ID. Server- and client-safe (NEXT_PUBLIC_ only), no copy.
 *
 * Both are OFF until the owner supplies the values, so this can ship before the Google accounts
 * exist. Setting either one takes a redeploy: NEXT_PUBLIC_ values are inlined at build time.
 *
 * Search Console, two ways to verify (the Domain property via a DNS TXT record needs neither):
 * - HTML tag: set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION to the `content` value Google shows. The
 *   root layout then emits <meta name="google-site-verification" content="…"> on every page.
 * - HTML file: drop the file Google offers (google0123456789abcdef.html) into /public, unchanged.
 *   It is served from the site root; /public files are not locale-prefixed or redirected.
 *
 * Google Analytics 4: set NEXT_PUBLIC_GA_MEASUREMENT_ID to the stream's "G-…" ID. Even then, gtag.js
 * is requested only in a browser whose visitor has allowed analytics (src/components/analytics/
 * GoogleAnalytics.tsx), and only in the Production environment, so Preview deployments and local
 * builds never send data to the live property. NEXT_PUBLIC_GA_ALLOW_NON_PRODUCTION=1 lifts the
 * Production-only rule for a local test against a throwaway ID; never set it in Vercel.
 */

import { isProduction } from "@/lib/env";

/** A GA4 web stream ID. Anything else (a UA- ID, a GTM- container, a typo) is ignored. */
const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

function readMeasurementId(): string | null {
  // Written out in full so Next inlines it into the client bundle.
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim().toUpperCase();
  return raw && MEASUREMENT_ID_PATTERN.test(raw) ? raw : null;
}

const allowOutsideProduction = process.env.NEXT_PUBLIC_GA_ALLOW_NON_PRODUCTION === "1";

/**
 * The GA4 measurement ID when analytics may run in this build, otherwise null. Null means no
 * analytics code is rendered at all, whatever the visitor answers.
 */
export const gaMeasurementId: string | null = isProduction || allowOutsideProduction ? readMeasurementId() : null;

/** Whether this build can load Google Analytics for a visitor who allows it. */
export const analyticsEnabled = gaMeasurementId !== null;

/** Search Console's HTML-tag token, or null. Emitted by the root layout's metadata only when set. */
export const googleSiteVerification: string | null = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || null;
