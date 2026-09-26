/**
 * Server environment validation (architecture.md §10.2).
 *
 * Server-only: the mail variables are not `NEXT_PUBLIC_`, so this module must be imported only
 * from server code (the quote page, and next.config.ts). `src/lib/env.ts` stays client-safe.
 *
 * This used to fail a Production build when mail was not configured, so that a deployment which
 * could not capture a lead never went live. It no longer does (owner decision, 2026-09-20):
 * Resend cannot send until irradiantenergy.in is verified with it and the domain is on registrar
 * hold, so the guard was keeping the whole site off production over a facility that could not
 * work yet.
 *
 * `leadEmailEnv` is null when it is not configured, and `mailConfigured` below is what the quote
 * page reads to disable its form rather than let someone fill in a form that cannot be sent.
 *
 * The Production build gate that remains is `assertProductionBuildEnv` at the end of this file,
 * for the canonical origin: without it the site ships out of search.
 */

import { z } from "zod";
import { CANONICAL_ORIGIN } from "./env";

const leadEmailEnvSchema = z.object({
  /** Resend API key. Secret; set per environment (D-012), never committed. */
  RESEND_API_KEY: z.string({ error: "RESEND_API_KEY is required to send lead emails" }).min(1, "RESEND_API_KEY is required to send lead emails"),
  /** Verified Resend sender. No default in production: the sender domain move is deferred (D-011). */
  EMAIL_FROM: z.email("EMAIL_FROM must be an email address"),
  /** Lead inbox: leads@ in Production, admin@ in Preview (D-012). */
  LEAD_EMAIL: z.email("LEAD_EMAIL must be an email address"),
});

export type LeadEmailEnv = z.infer<typeof leadEmailEnvSchema>;

function parseLeadEmailEnv() {
  return leadEmailEnvSchema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    LEAD_EMAIL: process.env.LEAD_EMAIL,
  });
}

/**
 * Outside Production (local, Preview, CI, tests) the variables stay optional, so the rest of
 * the site can be built and reviewed without mail credentials. Preview deliberately keeps
 * building: D-012 gives it its own key and points LEAD_EMAIL at admin@.
 */
const result = parseLeadEmailEnv();

/** Mail configuration, or `null` when it is not set up. */
export const leadEmailEnv: LeadEmailEnv | null = result.success ? result.data : null;

/** Whether the quote form can actually deliver. Read by the page to enable or disable it. */
export const mailConfigured = result.success;

type BuildEnv = Readonly<Record<string, string | undefined>>;

/** Where the fix goes, repeated in every message so the build log alone is enough. */
const FIX = `Set NEXT_PUBLIC_SITE_URL to ${CANONICAL_ORIGIN} for the Production environment in Vercel (Project → Settings → Environment Variables), then redeploy.`;

/**
 * What is wrong with this build's environment, one message per problem; empty when nothing is.
 *
 * Why it exists (SEO audit P0): indexing is switched on by NEXT_PUBLIC_SITE_URL alone
 * (`allowIndexing` in src/lib/env.ts), and leaving it unset was an error nowhere. The site built,
 * deployed and told every search engine to stay away (robots.txt `Disallow: /`, `noindex` on
 * every page), and Production served that for weeks before anyone noticed. A wrong value is as
 * bad: canonicals, hreflang, the sitemap and email links are all absolute on it, so the bare
 * domain or the *.vercel.app alias would point every canonical at a redirect.
 *
 * Only a Vercel Production build is checked (VERCEL_ENV, or NEXT_PUBLIC_VERCEL_ENV, which the site
 * itself reads). Preview, CI and local builds leave the variable unset on purpose, so that they
 * stay out of the index, and they keep building.
 */
export function productionBuildEnvProblems(env: BuildEnv = process.env): string[] {
  const serverEnv = env.VERCEL_ENV;
  const publicEnv = env.NEXT_PUBLIC_VERCEL_ENV;
  if (serverEnv !== "production" && publicEnv !== "production") return [];

  const problems: string[] = [];

  // The site decides "am I Production?" from the public copy (isProduction in src/lib/env.ts). If
  // Vercel is not exposing it, the build would ship as a non-production site: noindex again,
  // placeholders visible, no analytics.
  if (serverEnv === "production" && publicEnv !== "production") {
    problems.push(
      `VERCEL_ENV is "production" but NEXT_PUBLIC_VERCEL_ENV is ${JSON.stringify(publicEnv ?? "")}, and the site reads the public one: this build would ship as a preview, with noindex on every page. Turn on "Automatically expose System Environment Variables" in Vercel (Project → Settings → Environment Variables), then redeploy.`,
    );
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl === undefined || siteUrl.trim() === "") {
    problems.push(
      `NEXT_PUBLIC_SITE_URL is not set. Without it Production serves robots.txt "Disallow: /" and noindex on every page, and the site drops out of search. ${FIX}`,
    );
    return problems;
  }

  const shown = JSON.stringify(siteUrl);
  let url: URL;
  try {
    url = new URL(siteUrl);
  } catch {
    problems.push(`NEXT_PUBLIC_SITE_URL is ${shown}, which is not a URL. ${FIX}`);
    return problems;
  }

  if (url.protocol !== "https:") {
    problems.push(
      `NEXT_PUBLIC_SITE_URL is ${shown}; it must be an https URL, or every canonical and sitemap entry points at a redirect. ${FIX}`,
    );
  } else if (url.origin !== siteUrl) {
    // Pages append paths to it (`${siteUrl}/images/...`), so a trailing slash, a path, a query, a
    // port, credentials, capitals or stray whitespace would all end up in public URLs.
    problems.push(
      `NEXT_PUBLIC_SITE_URL is ${shown}; it must be a bare origin (https and a lowercase host only: no trailing slash, path, query, fragment, port or spaces). ${FIX}`,
    );
  } else if (siteUrl !== CANONICAL_ORIGIN) {
    problems.push(
      `NEXT_PUBLIC_SITE_URL is ${shown}, but the canonical origin is ${CANONICAL_ORIGIN}. A canonical URL must name the host that serves the page, not one that redirects to it. ${FIX} If the domain really has changed, update CANONICAL_ORIGIN in src/lib/env.ts first.`,
    );
  }

  return problems;
}

/**
 * The build gate, called from next.config.ts. Throwing there stops `next build`, so the bad
 * deployment never goes live and the previous one keeps serving. A no-op outside Production.
 */
export function assertProductionBuildEnv(env: BuildEnv = process.env): void {
  const problems = productionBuildEnvProblems(env);
  if (problems.length === 0) return;
  throw new Error(["Production build stopped by src/lib/env.server.ts:", ...problems.map((problem) => `  - ${problem}`)].join("\n"));
}
