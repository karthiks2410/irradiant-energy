import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { allowIndexing, siteUrl } from "@/lib/env";
import "./globals.css";

// Inter for display and body (owner direction, matching the prototype), IBM Plex Mono for data.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap", variable: "--font-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Rooftop solar for homes, housing societies and businesses`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // Indexing is switched on only when the real domain is configured (lib/env.ts).
  robots: allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { siteName: site.name, locale: "en_IN", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#02342b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-teal-900"
        >
          Skip to content
        </a>
        <SiteHeader />
        {/* Pages sit below the fixed header; the home hero pulls itself up with -mt-(--header-h). */}
        <main id="main" className="flex-1 pt-(--header-h)">
          {children}
        </main>
        <SiteFooter />
        <SmoothScroll />
        <JsonLd />
      </body>
    </html>
  );
}
