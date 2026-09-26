import type { NextConfig } from "next";

// Build gate. Importing this validates the server environment and throws when a Production
// build is missing RESEND_API_KEY / EMAIL_FROM / LEAD_EMAIL. There is no lead store yet
// (architecture.md OD-4), so the sales alert is the only record of an enquiry: a Production
// deployment without mail credentials would drop every lead one at a time. Failing here means
// the bad build never goes live and the previous deployment keeps serving. Outside Production
// it is a no-op, so local work and Preview still build without credentials.
import "./src/lib/env.server";
import { DEFAULT_LOCALE } from "./src/i18n/config";
import { ROUTES } from "./src/i18n/registry";

type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

// Baseline security headers (docs/discovery/15-security-risk-audit.md). A hash-based CSP is
// added once the page inventory is stable, so it can stay compatible with static rendering.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Legacy URL map (report §9.3; docs/discovery/16-seo-deep-dive.md §5.3): path-to-path and one
// hop, so the rules are safe on every host, including the irradiantenergie.com domains once they
// point at this project. `permanent` sends 308, which Google treats like 301. Query strings pass
// through, which keeps ?token= links from old quote emails alive; the /get-quote page must ignore
// the personal-data parameters (name, phone, email, society, company) that legacy links carry.
const legacyRedirects: Redirect[] = [
  // Both locales are URL-prefixed (owner decision), so the bare origin has to choose one.
  // 307, not 308: the browser must not cache this forever, because "/" is exactly where a
  // language hint would go if the owner ever wants one (architecture.md §11 Q9).
  { source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false },
  // The on-grid / off-grid / hybrid stubs fold into their audience page.
  {
    source: "/solutions/solar/:segment(home|housing-society|commercial)/:type",
    destination: "/en/solutions/solar/:segment",
    permanent: true,
  },
  // Industrial, roof rental and utility scale are served by the Business page.
  { source: "/solutions/solar/industrial/:path*", destination: "/en/solutions/solar/commercial", permanent: true },
  { source: "/solutions/solar/roof-rental/:path*", destination: "/en/solutions/solar/commercial", permanent: true },
  { source: "/solutions/solar/utility-scale/:path*", destination: "/en/solutions/solar/commercial", permanent: true },
  { source: "/solutions/solar", destination: "/en/solutions", permanent: true },
  // Storage and EV charging may return as offerings (D-009), so these stay temporary.
  { source: "/solutions/ess/:path*", destination: "/en/solutions", permanent: false },
  { source: "/solutions/ev-charging/:path*", destination: "/en/solutions", permanent: false },
  // The Learn articles may return after a fact-check.
  { source: "/discover/:path*", destination: "/en", permanent: false },
  // The old estimate-result page; its token query passes through to the calculator.
  { source: "/get-quote/result", destination: "/en/get-quote", permanent: false },

  /*
   * Unprefixed page URLs, which is what the old site published and what every link shared
   * before this change points at. Listed explicitly from the registry rather than matched with
   * a catch-all: a catch-all would also match "/en/about" and redirect it to "/en/en/about".
   *
   * These are a compatibility net for links that already exist in the world, NOT a licence for
   * the app to emit unprefixed hrefs — an unprefixed link inside the Kannada tree would bounce
   * the reader into English. Every internal link goes through <Link> in
   * src/components/i18n/LocaleLink.tsx, which cannot forget the prefix.
   *
   * Permanent (308): the move to /en is not going to be undone, and these are the URLs the old
   * site ranked for, so search engines should transfer them outright. Only "/" stays temporary,
   * for the reason given above.
   */
  ...ROUTES.filter((route) => route.path !== "/").map((route) => ({
    source: route.path,
    destination: `/${DEFAULT_LOCALE}${route.path}`,
    permanent: true,
  })),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The root layout sits under the [lang] dynamic segment, so there is no single layout Next can
  // compose a 404 from for a URL that matches no route at all. Without this flag those URLs get
  // Next's unstyled default page (verified). See src/app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // The Kannada webfont is served from /public, which Next does not cache-bust. Its filename
      // carries the upstream version (v32), so a new cut ships under a new name and this is safe.
      {
        source: "/fonts/:path*.woff2",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      // Keeps the *.vercel.app alias out of the index once the real domain is live (report §13.5).
      {
        source: "/(.*)",
        has: [{ type: "host", value: "(.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
