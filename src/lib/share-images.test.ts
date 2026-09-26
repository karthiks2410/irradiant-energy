import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LOCALES, OG_LOCALE } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { publishedLocales, ROUTES } from "@/i18n/registry";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import {
  SHARE_IMAGE_MAX_BYTES,
  SHARE_IMAGE_SIZE,
  SHARE_IMAGE_TYPE,
  SHARE_PAGES,
  shareCard,
  shareCardRecord,
  shareImagePath,
  sharePageFor,
} from "./share-images";

/**
 * The link-preview cards are committed files, written by `npm run build:share`. Nothing at build
 * time notices when one is missing, the wrong shape or too heavy — the preview just silently
 * degrades to a bare link — so this is the check.
 */

const publicFile = (sitePath: string) => fileURLToPath(new URL(`../../public${sitePath}`, import.meta.url));

/** Width and height from a baseline or progressive JPEG's start-of-frame segment. */
function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    offset += 2 + length;
  }
  return null;
}

describe("share card files", () => {
  for (const locale of LOCALES) {
    for (const page of SHARE_PAGES) {
      const sitePath = shareImagePath(page, locale);

      it(`${sitePath} exists, is ${SHARE_IMAGE_SIZE.width}x${SHARE_IMAGE_SIZE.height} and under the WhatsApp limit`, () => {
        const file = publicFile(sitePath);
        expect(existsSync(file), `${sitePath} is missing: run npm run build:share`).toBe(true);
        const bytes = readFileSync(file);
        expect(SHARE_IMAGE_TYPE).toBe("image/jpeg");
        expect(jpegSize(bytes)).toEqual(SHARE_IMAGE_SIZE);
        expect(bytes.byteLength).toBeLessThanOrEqual(SHARE_IMAGE_MAX_BYTES);
      });
    }
  }

  it("has no stray files that no page points at", () => {
    const expected = new Set<string>(LOCALES.flatMap((locale) => SHARE_PAGES.map((page) => shareImagePath(page, locale))));
    const found = LOCALES.flatMap((locale) =>
      readdirSync(publicFile(`/share/${locale}`)).map((name) => `/share/${locale}/${name}`),
    );
    expect(found.filter((path) => !expected.has(path))).toEqual([]);
  });
});

describe("share card copy", () => {
  it("reads every card's words from the page's own content, in both locales", () => {
    for (const locale of LOCALES) {
      const content = getContent(locale);
      for (const page of SHARE_PAGES) {
        const card = shareCard(page, content);
        expect(card.title.trim(), `${locale}/${page} title`).not.toBe("");
        expect(card.eyebrow.trim(), `${locale}/${page} eyebrow`).not.toBe("");
        // A copy edit that breaks the accent match renders the headline without its green run;
        // on the card that would go unnoticed until someone shared the page.
        if (card.accent) expect(card.title, `${locale}/${page} accent`).toContain(card.accent);
        for (const photo of card.photos) expect(content.images[photo.key], `${locale}/${page} photo`).toBeDefined();
      }
    }
  });

  it("matches what the committed images were rendered from (else run npm run build:share)", () => {
    const manifest = JSON.parse(readFileSync(new URL("./share-images.manifest.json", import.meta.url), "utf8"));
    for (const locale of LOCALES) {
      for (const page of SHARE_PAGES) {
        const key = `${locale}/${page}`;
        expect(manifest[key], `${key}: the card's copy or photo changed since its image was rendered`).toEqual(
          shareCardRecord(page, getContent(locale)),
        );
      }
    }
  });

  it("gives Kannada pages a Kannada headline", () => {
    for (const page of SHARE_PAGES) {
      expect(shareCard(page, getContent("kn")).title, page).not.toBe(shareCard(page, getContent("en")).title);
    }
  });
});

describe("page metadata", () => {
  for (const route of ROUTES) {
    for (const locale of publishedLocales(route.key)) {
      it(`${locale}${route.path} points og:image and twitter:image at its own card`, () => {
        const meta = pageMetadata({ title: "t", description: "d", path: route.path as `/${string}`, locale });
        const url = absoluteUrl(shareImagePath(sharePageFor(route.key), locale));
        const og = meta.openGraph as { images: Record<string, unknown>[]; locale: string; alternateLocale: string[] };
        const twitter = meta.twitter as { card: string; images: Record<string, unknown>[] };

        expect(og.images).toHaveLength(1);
        expect(og.images[0]).toMatchObject({ url, type: SHARE_IMAGE_TYPE, ...SHARE_IMAGE_SIZE });
        expect(String(og.images[0].url)).toMatch(/^https?:\/\//);
        expect(og.images[0].alt).toContain(shareCard(sharePageFor(route.key), getContent(locale)).title);
        expect(twitter.card).toBe("summary_large_image");
        expect(twitter.images[0]).toMatchObject({ url, ...SHARE_IMAGE_SIZE });

        expect(og.locale).toBe(OG_LOCALE[locale]);
        expect(og.alternateLocale).toEqual(publishedLocales(route.key).filter((l) => l !== locale).map((l) => OG_LOCALE[l]));
      });
    }
  }

  it("uses a page's own card where it has one, and the home card for the legal notices", () => {
    expect(sharePageFor("about")).toBe("about");
    expect(sharePageFor("solutions-commercial")).toBe("solutions-commercial");
    expect(sharePageFor("privacy")).toBe("home");
    expect(sharePageFor(null)).toBe("home");
  });
});
