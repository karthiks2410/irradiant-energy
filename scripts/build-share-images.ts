/**
 * Render the link-preview images: one 1200×630 JPEG per page and per locale, written to
 * `public/share/<locale>/<page>.jpg`.
 *
 *   npm run build:share                        render every card
 *   npm run build:share -- --only kn/about     render one card (repeatable)
 *
 * Why this is a script and not a `next/og` route: Satori cannot shape Kannada, so a Kannada
 * headline comes out as broken conjuncts. Chromium shapes it properly with the site's own
 * self-hosted Noto Sans Kannada (public/fonts), so the cards are rendered here, in Playwright's
 * Chromium, and committed as static files. Re-run it whenever a headline, a photograph or the
 * logo changes. It also writes `src/lib/share-images.manifest.json`, a record of what each file
 * says; `src/lib/share-images.test.ts` fails if a file goes missing or out of spec, or if the
 * content has moved on from that record.
 *
 * What goes on a card, and which page gets which card, lives in src/lib/share-images.ts, which
 * `pageMetadata` reads too. The copy comes from the locale's merged content (`getContent`), so a
 * card never says anything its page does not.
 *
 * Fonts: the Kannada face is the site's own file. Inter and IBM Plex Mono are what the site
 * serves through next/font, which is a build-time download from Google Fonts; this script loads
 * the same families from the same place, and stops rather than writing a card set in a
 * fallback face if they fail to load.
 *
 * Node 24 runs TypeScript directly. The resolve hook teaches Node the `@/*` alias and the
 * extensionless and directory imports that tsconfig.json and the bundler already understand.
 */

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const SRC = path.join(ROOT, "src");
const PUBLIC = path.join(ROOT, "public");
const MANIFEST = path.join(SRC, "lib/share-images.manifest.json");

const SRC_URL = pathToFileURL(SRC + path.sep).href;

registerHooks({
  resolve(specifier, context, nextResolve) {
    let spec = specifier;
    if (spec.startsWith("@/")) spec = pathToFileURL(path.join(SRC, spec.slice(2))).href;
    // Only the app's own modules need the bundler's rules; node_modules (Playwright is CommonJS
    // with extensionless requires) resolves the ordinary way.
    const own = spec.startsWith(SRC_URL) || (spec.startsWith(".") && context.parentURL?.startsWith(SRC_URL));
    if (own) {
      const url = spec.startsWith("file://") ? spec : new URL(spec, context.parentURL).href;
      const file = fileURLToPath(url);
      if (!existsSync(file) || !statSync(file).isFile()) {
        for (const candidate of [`${file}.ts`, path.join(file, "index.ts")]) {
          if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
      return { url, shortCircuit: true };
    }
    return nextResolve(spec, context);
  },
});

const load = (rel: string) => import(pathToFileURL(path.join(SRC, rel)).href);

const { LOCALES } = (await load("i18n/config.ts")) as typeof import("../src/i18n/config.ts");
const { getContent } = (await load("i18n/content.ts")) as typeof import("../src/i18n/content.ts");
const { splitOnAccent } = (await load("components/ui/accent-split.ts")) as typeof import("../src/components/ui/accent-split.ts");
const share = (await load("lib/share-images.ts")) as typeof import("../src/lib/share-images.ts");
const { chromium } = await import("@playwright/test");

type Locale = (typeof LOCALES)[number];
type SharePage = (typeof share.SHARE_PAGES)[number];
type ShareCard = ReturnType<typeof share.shareCard>;

const { width: WIDTH, height: HEIGHT } = share.SHARE_IMAGE_SIZE;

/** Aim this far under the hard ceiling, so a re-encode on a CDN never tips a file over it. */
const TARGET_BYTES = 240_000;
const QUALITIES = [86, 82, 78, 74, 70, 66, 62] as const;

// ---------------------------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------------------------

const only = new Set<string>();
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === "--only" && process.argv[i + 1]) only.add(process.argv[++i]);
}

const jobs: { locale: Locale; page: SharePage }[] = LOCALES.flatMap((locale) =>
  share.SHARE_PAGES.map((page) => ({ locale, page })),
).filter(({ locale, page }) => only.size === 0 || only.has(`${locale}/${page}`));

if (jobs.length === 0) {
  console.error(`Nothing matches --only ${[...only].join(", ")}. Pages: ${share.SHARE_PAGES.join(", ")}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// The card
// ---------------------------------------------------------------------------------------------

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function headline({ title, accent }: ShareCard): string {
  const split = splitOnAccent(title, accent);
  if (!split) return escape(title);
  return `${escape(split.before)}<span class="accent">${escape(split.accent)}</span>${escape(split.after)}`;
}

/**
 * Brand pairings only (brand PDF; src/app/globals.css): white and Solar Yellow on Deep Teal, the
 * accent in Radiant Green at display size, one Solar Yellow "Light Horizon" rule. The photograph
 * is the card's one device, so there is no Radiant Field.
 *
 * Composition. The owner's photograph runs full bleed in its own colours, the white lockup over
 * the sky, and the page's headline stands on a Deep Teal panel rising from the base edge.
 * Everything that carries meaning sits in a centred 600px column: WhatsApp and iMessage show the
 * picture either whole (1.91:1) or as a square cut from the middle, and X trims the top and
 * bottom to 2:1. The column survives all three; the photograph fills what a wide preview adds
 * either side. Type is sized for a phone chat bubble about 330px wide, where the headline still
 * reads at 13–18px.
 */
function cardHtml(locale: Locale, card: ShareCard, content: ReturnType<typeof getContent>): string {
  const photos = card.photos
    .map(({ key, position, zoom }) => {
      const image = content.images[key];
      const scale = zoom ? `;transform:scale(${zoom});transform-origin:${position}` : "";
      return `<div class="frame"><img src="${image.src}" alt="" style="object-position:${position}${scale}"></div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800&family=IBM+Plex+Mono:wght@500&display=block">
<style>
  @font-face {
    font-family: "Noto Sans Kannada Web";
    font-style: normal;
    font-weight: 100 900;
    font-display: block;
    src: url("/fonts/noto-sans-kannada-v32-kannada-wght.woff2") format("woff2");
    unicode-range: U+0951-0952, U+0964-0965, U+0C80-0CF3, U+1CD0, U+1CD2-1CD3, U+1CDA, U+1CF2,
      U+1CF4, U+200C-200D, U+20B9, U+25CC, U+A830-A835;
  }
  :root {
    --teal-900: #02342b;
    --teal-975: #01201b;
    --green-500: #06a64c;
    --yellow-400: #ffcd00;
    --white: #ffffff;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; background: var(--teal-900); }
  .card {
    position: relative; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden;
    color: var(--white); font-family: Inter, "Noto Sans Kannada Web", sans-serif;
    -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision;
  }
  .photos { position: absolute; inset: 0; display: flex; gap: 6px; background: var(--teal-975); }
  .frame { flex: 1 1 0; min-width: 0; overflow: hidden; }
  .frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  /* The photograph keeps its own colours. A light wash at the top keeps the white logo clear of
     a bright sky; nothing else is laid over the picture. */
  .sky { position: absolute; inset: 0 0 auto 0; height: 190px; background: linear-gradient(180deg, rgb(1 32 27 / 0.55), rgb(1 32 27 / 0)); }
  /* The copy stands on a Deep Teal panel rising from the base edge. Its top edge is placed from
     the copy block after the headline is fitted (--copy-top), so a four-line Kannada headline
     gets the same margin as a two-line English one. The Solar Yellow rule along that edge is the
     brand's Light Horizon — the one yellow line on the card. */
  .panel {
    position: absolute; left: 50%; width: 680px; margin-left: -340px; bottom: 0;
    top: calc(var(--copy-top) - 40px);
    background: var(--teal-900); border-top: 4px solid var(--yellow-400);
    box-shadow: 0 -20px 60px rgb(1 32 27 / 0.3);
  }
  .content {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
    justify-content: space-between; padding: 40px 0 40px; text-align: center;
  }
  .logo { height: 56px; width: auto; display: block; filter: drop-shadow(0 1px 12px rgb(1 32 27 / 0.35)); }
  .copy { width: 600px; display: flex; flex-direction: column; align-items: center; }
  .eyebrow {
    display: flex; align-items: center; gap: 14px; margin: 0;
    font: 500 23px/1.2 "IBM Plex Mono", "Noto Sans Kannada Web", monospace;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--yellow-400);
  }
  .eyebrow::before, .eyebrow::after { content: ""; width: 28px; height: 2px; background: currentColor; flex: none; }
  h1 {
    margin: 18px 0 0; font-weight: 800; line-height: 1.06; letter-spacing: -0.022em;
    text-wrap: balance;
  }
  .accent { color: var(--green-500); }
  .domain {
    margin: 24px 0 0; font: 500 28px/1 "IBM Plex Mono", monospace; letter-spacing: 0.04em;
    color: rgb(255 255 255 / 0.88);
  }
  /* Kannada: the site's own adjustments (globals.css html:lang(kn)) — a lighter weight, looser
     leading for the stacked vowel signs, and no capitals or tracking to apply. */
  html:lang(kn) h1 { font-weight: 700; line-height: 1.34; letter-spacing: normal; }
  html:lang(kn) .eyebrow { font: 600 26px/1.3 "Noto Sans Kannada Web", sans-serif; letter-spacing: normal; text-transform: none; }
</style>
</head>
<body>
  <div class="card">
    <div class="photos">${photos}</div>
    <div class="sky"></div>
    <div class="panel"></div>
    <div class="content">
      <img class="logo" src="/images/ie-logo-lockup.svg" alt="">
      <div class="copy">
        <p class="eyebrow">${escape(card.eyebrow)}</p>
        <h1>${headline(card)}</h1>
        <p class="domain">${escape(share.shareDomain(content))}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------------------------

/** A private origin the page is served from: the card HTML at "/", everything else from public/. */
const ORIGIN = "https://share-card.invalid";

const TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
const page = await context.newPage();

let html = "";
await page.route(`${ORIGIN}/**`, async (route) => {
  const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
  if (pathname === "/") return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: html });
  const file = path.join(PUBLIC, pathname);
  if (!file.startsWith(PUBLIC + path.sep) || !existsSync(file)) return route.fulfill({ status: 404, body: "" });
  return route.fulfill({
    status: 200,
    contentType: TYPES[path.extname(file)] ?? "application/octet-stream",
    body: readFileSync(file),
  });
});

let failed = false;
// `--only` re-renders part of the set, so the record of the rest is carried over.
const manifest: Record<string, unknown> = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};

for (const { locale, page: sharePage } of jobs) {
  const content = getContent(locale);
  const card = share.shareCard(sharePage, content);
  html = cardHtml(locale, card, content);
  await page.goto(`${ORIGIN}/`, { waitUntil: "load" });

  // Fit the headline: start large, step down until it fits the height budget — three lines of
  // English, about four of Kannada — which leaves a clear band of photograph under the logo.
  // Then hand the copy block's top edge to the panel, so the teal rises from just above it.
  const fit = await page.evaluate(async (locale) => {
    // Faces load lazily, so ask for each one the card can use before checking it arrived.
    const faces: [string, string][] = [
      ["800 40px Inter", "A"],
      ["700 40px Inter", "A"],
      ["500 20px 'IBM Plex Mono'", "a"],
      ...(locale === "kn" ? ([["700 40px 'Noto Sans Kannada Web'", "ಕ"]] as [string, string][]) : []),
    ];
    await Promise.all(faces.map(([font, text]) => document.fonts.load(font, text)));
    await document.fonts.ready;
    const h1 = document.querySelector("h1") as HTMLElement;
    const images = [...document.images];
    await Promise.all(images.map((img) => img.decode()));
    const missing = faces.filter(([font, text]) => !document.fonts.check(font, text)).map(([font]) => font);
    const max = locale === "kn" ? { size: 56, min: 40, height: 250 } : { size: 66, min: 44, height: 216 };
    let size = max.size;
    for (; size >= max.min; size -= 2) {
      h1.style.fontSize = `${size}px`;
      if (h1.getBoundingClientRect().height <= max.height) break;
    }
    const copy = document.querySelector(".copy") as HTMLElement;
    document.documentElement.style.setProperty("--copy-top", `${Math.round(copy.getBoundingClientRect().top)}px`);
    const brokenImages = images.filter((img) => !img.naturalWidth).map((img) => img.src);
    const overflow = h1.getBoundingClientRect().height > max.height;
    return { size, height: Math.round(h1.getBoundingClientRect().height), overflow, missing, brokenImages };
  }, locale);

  const label = `${locale}/${sharePage}`;
  if (fit.missing.length) {
    throw new Error(`${label}: web font(s) did not load (${fit.missing.join(", ")}); refusing to write a card in a fallback face`);
  }
  if (fit.overflow) throw new Error(`${label}: the headline does not fit even at ${fit.size}px; shorten it or raise the budget`);
  if (fit.brokenImages.length) throw new Error(`${label}: images failed to load: ${fit.brokenImages.join(", ")}`);

  let jpeg: Buffer | undefined;
  let quality = 0;
  for (quality of QUALITIES) {
    jpeg = await page.screenshot({ type: "jpeg", quality, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    if (jpeg.byteLength <= TARGET_BYTES) break;
  }
  if (!jpeg) throw new Error(`${label}: no screenshot`);

  const out = path.join(PUBLIC, share.shareImagePath(sharePage, locale));
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, jpeg);

  // Check what was written, not what was asked for.
  const decoded = await page.evaluate(async (b64) => {
    const bitmap = await createImageBitmap(await (await fetch(`data:image/jpeg;base64,${b64}`)).blob());
    return { width: bitmap.width, height: bitmap.height };
  }, jpeg.toString("base64"));
  const ok = decoded.width === WIDTH && decoded.height === HEIGHT && jpeg.byteLength <= share.SHARE_IMAGE_MAX_BYTES;
  if (!ok) failed = true;
  else manifest[label] = share.shareCardRecord(sharePage, content);
  console.log(
    `${ok ? "ok  " : "FAIL"} ${path.relative(ROOT, out)}  ${decoded.width}x${decoded.height}  ` +
      `${(jpeg.byteLength / 1024).toFixed(0)} KB  q${quality}  headline ${fit.size}px / ${fit.height}px`,
  );
}

await browser.close();

const ordered = Object.fromEntries(
  LOCALES.flatMap((locale) => share.SHARE_PAGES.map((page) => `${locale}/${page}`))
    .filter((key) => key in manifest)
    .map((key) => [key, manifest[key]]),
);
writeFileSync(MANIFEST, `${JSON.stringify(ordered, null, 2)}\n`);

if (failed) process.exit(1);
