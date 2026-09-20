import type { Metadata } from "next";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/env";

/**
 * Per-page metadata helper (report §13.1 C1/H5; docs/architecture.md §8.1).
 *
 * Usage in a page.tsx (Server Component):
 *
 *   export const metadata = pageMetadata({
 *     title: "Rooftop solar for homes in Bengaluru", // ≤ 60 chars; " | Irradiant Energy" is appended
 *     description: "…",                              // 120–155 chars, plain text
 *     path: "/solutions/solar/home",                 // this page's own route
 *   });
 *
 * or from generateMetadata for a dynamic segment:
 *
 *   export async function generateMetadata({ params }: PageProps<"/solutions/solar/[segment]">) {
 *     const { segment } = await params;
 *     return pageMetadata({ title, description, path: `/solutions/solar/${segment}` });
 *   }
 *
 * What it guarantees:
 * - The title always carries the brand. The root layout's title.template only reaches child
 *   segments, so the home page (same segment as the layout) gets the suffix from here instead.
 * - The canonical is ALWAYS the page's own path, made absolute through the layout's metadataBase.
 *   Never set alternates.canonical in a layout: the old site pointed 32 URLs at the home page.
 * - og:url matches the canonical; siteName, locale (en_IN) and type are always present. Next merges
 *   metadata shallowly, so a page that sets any openGraph field replaces the layout's whole object;
 *   this helper therefore emits complete openGraph and twitter objects every time.
 * - The social image defaults to the site-wide generated routes (app/opengraph-image.tsx and
 *   app/twitter-image.tsx). Pass `image` for a page-specific one; a colocated opengraph-image file
 *   is NOT picked up automatically once a page sets openGraph, so reference its route explicitly.
 * - robots is inherited from the root layout (index only when allowIndexing). Pass noindex for
 *   pages that must never be indexed, such as a form confirmation; they also get no canonical.
 */
export interface PageMetadataInput {
  title: string;
  description: string;
  /** The page's own route, starting with "/". Home is "/". */
  path: `/${string}`;
  /** Page-specific social image. Absolute URL or a site path such as "/about/opengraph-image". */
  image?: { url: string; alt: string; width?: number; height?: number };
  noindex?: boolean;
}

/** Route and dimensions of the site-wide social images; the image routes read these too. */
export const socialImage = {
  openGraphPath: "/opengraph-image",
  twitterPath: "/twitter-image",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
} as const;

/** Absolute URL for a site path. "/" resolves to the bare origin, matching Next's canonical output. */
export function absoluteUrl(path: string): string {
  const url = new URL(path, siteUrl);
  return path === "/" ? url.origin : url.href;
}

export function pageMetadata({ title, description, path, image, noindex = false }: PageMetadataInput): Metadata {
  const ogImage = image ?? {
    url: socialImage.openGraphPath,
    alt: socialImage.alt,
    width: socialImage.width,
    height: socialImage.height,
  };
  const twitterImage = image ?? { ...ogImage, url: socialImage.twitterPath };

  return {
    // `title.template` from the root layout applies to CHILD segments only, so app/page.tsx —
    // which shares the root segment — would otherwise ship a title with no brand in it. Home
    // spells the suffix out; every other route inherits the template.
    title: path === "/" ? { absolute: `${title} | ${site.name}` } : title,
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : { alternates: { canonical: path } }),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: "en_IN",
      url: path,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [twitterImage],
    },
  };
}
