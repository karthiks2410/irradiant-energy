import type { Metadata } from "next";
import { site } from "@/content/site";
import { HREFLANG, OG_LOCALE, type Locale } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { fill } from "@/i18n/format";
import { localizePath } from "@/i18n/paths";
import { publishedLocales, routeForPath, type RouteKey } from "@/i18n/registry";
import { siteUrl } from "@/lib/env";
import { SHARE_IMAGE_SIZE, SHARE_IMAGE_TYPE, shareCard, shareImagePath, sharePageFor } from "@/lib/share-images";

/**
 * Per-page metadata helper (report §13.1 C1/H5; docs/architecture.md §8.1).
 *
 * Usage in a page.tsx (Server Component):
 *
 *   export const metadata = pageMetadata({
 *     title: "Rooftop solar for homes in Karnataka", // ≤ 60 chars; " | Irradiant Energy" is appended
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
 * - og:url matches the canonical; siteName, locale (en_IN / kn_IN), the other published locale as
 *   og:locale:alternate, and type are always present. Next merges metadata shallowly, so a page
 *   that sets any openGraph field replaces the layout's whole object; this helper therefore emits
 *   complete openGraph and twitter objects every time.
 * - The link-preview image is the page's own card in the page's own language
 *   (src/lib/share-images.ts): a static JPEG under /share/<locale>/, absolute on siteUrl, with its
 *   size, type and alt text. Pages without a card of their own (the legal notices) use the home
 *   card. There is nothing to pass: the card is found from `path`.
 * - robots is inherited from the root layout (index only when allowIndexing). Pass noindex for
 *   pages that must never be indexed, such as a form confirmation; they also get no canonical.
 */
export interface PageMetadataInput {
  title: string;
  description: string;
  /**
   * The page's own route WITHOUT the locale prefix, starting with "/". Home is "/".
   * The prefix is added here, so a call site never has to think about it.
   */
  path: `/${string}`;
  /** The locale this page is being rendered in. Server pages read it with getLocale(). */
  locale: Locale;
  noindex?: boolean;
}

/** Absolute URL for a site path. "/" resolves to the bare origin, matching Next's canonical output. */
export function absoluteUrl(path: string): string {
  const url = new URL(path, siteUrl);
  return path === "/" ? url.origin : url.href;
}

/**
 * The link-preview image for a route, in the reader's language: the same object serves og:image
 * and twitter:image, since both point at the one static file.
 *
 * The alt text says what the card says — the brand, then the page's headline — in the page's own
 * language. `socialImageAlt` is the two-hole "{siteName} — {tagline}" frame; its second hole
 * carries the card's headline.
 */
export function shareImage(key: RouteKey | null | undefined, locale: Locale) {
  const page = sharePageFor(key);
  const content = getContent(locale);
  return {
    url: absoluteUrl(shareImagePath(page, locale)),
    width: SHARE_IMAGE_SIZE.width,
    height: SHARE_IMAGE_SIZE.height,
    type: SHARE_IMAGE_TYPE,
    alt: fill(content.ui.meta.socialImageAlt, { siteName: site.name, tagline: shareCard(page, content).title }),
  };
}

export function pageMetadata({ title, description, path, locale, noindex = false }: PageMetadataInput): Metadata {
  const canonical = localizePath(path, locale);
  // hreflang is published only for a pair that actually resolves in both locales; a link to a
  // 404 is worse than no link. The registry is the single source of that truth.
  const entry = routeForPath(path);
  const alternateLocales = entry ? publishedLocales(entry.key) : [locale];
  const languages = Object.fromEntries([
    ...alternateLocales.map((l) => [HREFLANG[l], localizePath(path, l)]),
    ["x-default", localizePath(path, "en")],
  ]);
  const image = shareImage(entry?.key, locale);

  return {
    // `title.template` from the root layout applies to CHILD segments only, so app/page.tsx —
    // which shares the root segment — would otherwise ship a title with no brand in it. Home
    // spells the suffix out; every other route inherits the template.
    title: path === "/" ? { absolute: `${title} | ${site.name}` } : title,
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : { alternates: { canonical, languages } }),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: OG_LOCALE[locale],
      alternateLocale: alternateLocales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      url: canonical,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      description,
      images: [image],
    },
  };
}
