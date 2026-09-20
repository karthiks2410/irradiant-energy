import type { NextConfig } from "next";

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
  // The on-grid / off-grid / hybrid stubs fold into their audience page.
  {
    source: "/solutions/solar/:segment(home|housing-society|commercial)/:type",
    destination: "/solutions/solar/:segment",
    permanent: true,
  },
  // Industrial, roof rental and utility scale are served by the Business page.
  { source: "/solutions/solar/industrial/:path*", destination: "/solutions/solar/commercial", permanent: true },
  { source: "/solutions/solar/roof-rental/:path*", destination: "/solutions/solar/commercial", permanent: true },
  { source: "/solutions/solar/utility-scale/:path*", destination: "/solutions/solar/commercial", permanent: true },
  { source: "/solutions/solar", destination: "/solutions", permanent: true },
  // Storage and EV charging may return as offerings (D-009), so these stay temporary.
  { source: "/solutions/ess/:path*", destination: "/solutions", permanent: false },
  { source: "/solutions/ev-charging/:path*", destination: "/solutions", permanent: false },
  // The Learn articles may return after a fact-check.
  { source: "/discover/:path*", destination: "/", permanent: false },
  // The old estimate-result page; its token query passes through to the calculator.
  { source: "/get-quote/result", destination: "/get-quote", permanent: false },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
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
