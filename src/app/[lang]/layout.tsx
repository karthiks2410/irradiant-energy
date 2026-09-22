import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { ConsentManager } from "@/components/consent";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppBubble } from "@/components/ui/WhatsAppBubble";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { site } from "@/content/site";
import { HTML_LANG, OG_LOCALE } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { allowIndexing, siteUrl } from "@/lib/env";
import "../globals.css";

/**
 * The one root layout. Both locales are URL-prefixed, so `[lang]` is a root parameter and every
 * Server Component below can read it with `getLocale()`.
 *
 * `dynamicParams = false` plus a per-page `generateStaticParams` (see src/i18n/registry.ts) is the
 * publishing gate: any segment that is not a published locale for that page is a 404. This layout
 * must NOT export `generateStaticParams` — a layout-level list overrides an empty page-level one
 * and would publish an unreviewed page. src/i18n/registry.test.ts asserts that.
 */
export const dynamicParams = false;

// Inter for display and body (owner direction, matching the prototype), IBM Plex Mono for data.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
// preload:false on purpose — Plex Mono only sets small labels, eyebrows and figures, never the
// LCP headline. Preloading it put two extra files ahead of the render-blocking stylesheet, which
// delayed first paint on a bandwidth-limited connection. It still loads, just off the critical path.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  variable: "--font-plex-mono",
});
/**
 * Noto Sans Kannada is NOT loaded through next/font (docs/kannada/research/typography.md §6.1).
 * Its @font-face lives in globals.css against a self-hosted copy of the Google "kannada" subset,
 * for three reasons:
 *
 * 1. One layout serves both locales, so a next/font call would emit its preload link — and its
 *    own extra stylesheet — on English routes too. As a rule in the shared stylesheet it costs
 *    English pages a few hundred bytes and no request.
 * 2. A *declared* face downloads nothing until some rendered text names that family, and
 *    `--font-kannada` only enters a font stack inside the `html:lang(kn)` block. So the "ಕನ್ನಡ"
 *    switcher label on an English page renders from the system Kannada stack at zero bytes
 *    (typography.md §5.9). e2e/i18n.spec.ts asserts that.
 * 3. The restricted `unicode-range` puts ₹ (U+20B9) and ZWNJ/ZWJ in the Kannada file, which is
 *    what stops a Kannada page also pulling Inter latin-ext (+83 KB) and Noto latin (+27 KB)
 *    (typography.md §5.6).
 *
 * The preload below is therefore conditional, which next/font cannot be here: Kannada routes get
 * the font off the critical path, English routes never mention it.
 */
export const KANNADA_FONT_URL = "/fonts/noto-sans-kannada-v32-kannada-wght.woff2";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} | Rooftop solar for homes, housing societies and businesses`,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    // Indexing is switched on only when the real domain is configured (lib/env.ts).
    robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { siteName: site.name, locale: OG_LOCALE[locale], type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#02342b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();

  return (
    <html lang={HTML_LANG[locale]} className={`${inter.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {locale === "kn" && (
          <link rel="preload" href={KANNADA_FONT_URL} as="font" type="font/woff2" crossOrigin="anonymous" />
        )}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-900"
        >
          Skip to content
        </a>
        <ScrollProgress />
        <SiteHeader />
        {/* Pages sit below the fixed header; the home hero pulls itself up with -mt-(--header-h). */}
        <main id="main" className="flex-1 pt-(--header-h)">
          {children}
        </main>
        <SiteFooter />
        {/* Consent UI mounts last: it renders nothing until a choice is needed. */}
        <WhatsAppBubble />
        <ConsentManager />
        <SmoothScroll />
        <JsonLd />
      </body>
    </html>
  );
}
