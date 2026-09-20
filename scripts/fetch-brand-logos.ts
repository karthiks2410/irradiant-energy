/**
 * Fetch the equipment brands' official marks once and store them in the repository.
 *
 * Why store them rather than hotlink. A logo service URL in the page means every visitor's
 * browser announces itself to that service on every page view — a third-party request on a site
 * whose consent banner tells people no third parties load. It is also a runtime dependency on
 * someone else's uptime for a decorative asset. Fetching once and serving the file first-party
 * costs nothing at runtime and keeps the promise the banner makes.
 *
 * Run: npm run fetch:logos
 *
 * It reads the key from .env.local, which is gitignored, so the value never reaches the
 * repository or a transcript. Set one of:
 *
 *   LOGO_DEV_TOKEN=pk_...        (logo.dev — its publishable key, the one meant to be public)
 *   LOGO_DEV_SECRET=sk_...       (optional; unlocks Brand Search — see below)
 *   BRANDFETCH_CLIENT_ID=...     (Brandfetch's Brand Search / CDN client id)
 *
 * What the secret is for. The image endpoint is addressed by domain, so it only works if the
 * domain in the content is right — and a guessed domain fails in two ways that look alike: the
 * service returns another company's mark, or it generates a coloured monogram and serves that
 * with a 200. Brand Search takes the company NAME and returns its real domain, which removes the
 * guess. Three of the seventeen failed exactly this way on the first run.
 *
 * The secret must never reach the browser, this file, a commit or a transcript. It lives in
 * .env.local, which is gitignored, and is used only here, at author time.
 *
 * The marks themselves are third-party trademarks. Fetching them is not permission to use them:
 * see the held item `proto:partners:logos` in src/content/home.ts. This script only puts the
 * files on disk; the rail keeps rendering lettermarks until each `logo` is set in the content.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "public/images/brands");

/**
 * Read the brands straight out of the content module's source rather than importing it. The
 * content layer is written against the `@/` path alias, which a plain node script cannot
 * resolve, and pulling in a resolver for an author-time tool is not worth it. This keeps one
 * source of truth for the list without a build step.
 */
function readBrands(): { name: string; domain: string }[] {
  const source = readFileSync(join(ROOT, "src/content/home.ts"), "utf8");
  const pattern = /\{ name: "([^"]+)", category: "[^"]+", domain: "([^"]+)" \}/g;
  const out: { name: string; domain: string }[] = [];
  for (const match of source.matchAll(pattern)) out.push({ name: match[1], domain: match[2] });
  if (!out.length) throw new Error("No brands found in src/content/home.ts — has the shape changed?");
  return out;
}

/** Minimal .env.local reader: no dependency, and it never logs a value. */
function readEnvLocal(): Record<string, string> {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (match) out[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const env = { ...readEnvLocal(), ...process.env };
const logoDev = env.LOGO_DEV_TOKEN;
const logoDevSecret = env.LOGO_DEV_SECRET;
const brandfetch = env.BRANDFETCH_CLIENT_ID;

if (!logoDev && !brandfetch) {
  console.error(
    [
      "No logo API key found.",
      "",
      "Add one line to .env.local (gitignored), then run this again:",
      "",
      "  LOGO_DEV_TOKEN=pk_your_publishable_key",
      "    or",
      "  BRANDFETCH_CLIENT_ID=your_client_id",
      "",
      "logo.dev's publishable key is the one designed to appear in client code; do not use a",
      "secret key here.",
    ].join("\n"),
  );
  process.exit(1);
}

const source = logoDev ? "logo.dev" : "brandfetch";
const urlFor = (domain: string) =>
  logoDev
    ? `https://img.logo.dev/${domain}?token=${logoDev}&size=256&format=png&retina=true`
    : `https://cdn.brandfetch.io/${domain}/w/256/h/256?c=${brandfetch}`;

/**
 * Ask Brand Search for the company's real domain. Returns null when there is no secret, no
 * match, or the call fails — the caller then falls back to the domain written in the content.
 */
async function findDomain(name: string): Promise<string | null> {
  if (!logoDevSecret) return null;
  try {
    const response = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(name)}`, {
      headers: { Authorization: `Bearer ${logoDevSecret}` },
    });
    if (!response.ok) return null;
    const results = (await response.json()) as { name?: string; domain?: string }[];
    return Array.isArray(results) && results[0]?.domain ? results[0].domain : null;
  } catch {
    return null;
  }
}

/** A logo service answers 200 with a generated monogram when it has nothing; that is not a logo. */
function looksLikeAnImage(bytes: Uint8Array, contentType: string | null) {
  if (contentType?.includes("text/html")) return false;
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const svg = new TextDecoder().decode(bytes.slice(0, 200)).includes("<svg");
  const webp = new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF";
  return png || jpg || svg || webp;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

mkdirSync(OUT, { recursive: true });

const got: string[] = [];
const missed: string[] = [];

const brands = readBrands();

for (const brand of brands) {
  try {
    // Prefer the domain Brand Search gives for the name over the one guessed in the content.
    const searched = await findDomain(brand.name);
    const domain = searched ?? brand.domain;
    if (searched && searched !== brand.domain) {
      console.log(`  search: ${brand.name} — content says ${brand.domain}, logo.dev says ${searched}`);
    }
    const response = await fetch(urlFor(domain), { redirect: "follow" });
    if (!response.ok) {
      missed.push(`${brand.name} (${domain}) — HTTP ${response.status}`);
      continue;
    }
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!looksLikeAnImage(bytes, response.headers.get("content-type"))) {
      missed.push(`${brand.name} (${domain}) — not an image, ${bytes.length} bytes`);
      continue;
    }
    const ext = new TextDecoder().decode(bytes.slice(0, 200)).includes("<svg") ? "svg" : "png";
    const file = `${slug(brand.name)}.${ext}`;
    writeFileSync(join(OUT, file), bytes);
    got.push(`${brand.name} -> /images/brands/${file} (${Math.round(bytes.length / 1024)}kB)`);
  } catch (error) {
    missed.push(`${brand.name} (${brand.domain}) — ${(error as Error).message}`);
  }
}

console.log(`Source: ${source}\n`);
console.log(`Fetched ${got.length}/${brands.length}:`);
for (const line of got) console.log(`  ${line}`);
if (missed.length) {
  console.log(`\nNot fetched (${missed.length}) — check the domain, or supply the file by hand:`);
  for (const line of missed) console.log(`  ${line}`);
}
console.log(
  [
    "",
    "Next: LOOK at each file before wiring it up — a logo service will happily return the wrong",
    "company for a guessed domain. Then set `logo` on that brand in src/content/home.ts.",
    "",
    "These are third-party trademarks. Putting them beside ours reads as an endorsement, so each",
    "one needs its brand's press-kit terms checked, or its permission. See `proto:partners:logos`.",
  ].join("\n"),
);
