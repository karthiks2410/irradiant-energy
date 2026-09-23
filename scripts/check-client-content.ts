/**
 * Build gate: no `"use client"` module may import a content module.
 *
 *   npm run check:client-content
 *
 * Why it has to be a gate and not a convention. `getContent()` pulls in BOTH locales' copy, and
 * every content module is one import away from it. The moment a client component imports one —
 * even for a single label — the bundler follows the graph and ships the lot:
 *
 * - every English page's JavaScript carries the Kannada copy, which is the thing the font work
 *   went to some trouble to avoid;
 * - every Kannada page's payload carries the English, so a reader who is meant to be reading
 *   Kannada is downloading both;
 * - and `held` copy — lines withheld because they are unevidenced claims — travels with it into
 *   the browser, where anyone can read it.
 *
 * None of that shows up on screen, so nothing else would catch it.
 *
 * The rule strings arrive as props from a Server Component instead. That is what
 * <HeroBackdrop>, <BrandRail>, <MobileMenu>, <SolutionsMenu> and <HomeCalculatorPanel> do.
 *
 * TYPE imports are allowed and are not a leak: `import type` is erased before bundling, so a
 * shape can be shared without a byte of copy crossing over.
 *
 * It is a source scan, not a bundle scan: it names the file and the line that caused the problem
 * rather than a hashed chunk. The bundle-level check (no Kannada codepoints in an English chunk)
 * belongs with the e2e suite, which can read the built output.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const SRC = path.join(ROOT, "src");

/** Modules that carry copy, or that reach it. */
const FORBIDDEN = [
  { test: /^@\/content(\/|$)/, why: "content modules carry both locales' copy" },
  { test: /^@\/i18n\/content$/, why: "getContent() merges both locales" },
  { test: /^@\/i18n\/server$/, why: "next/root-params is server-only" },
  { test: /^\.{1,2}\/.*\bcontent\//, why: "content modules carry both locales' copy" },
];

/**
 * Files exempt from the rule, each with the reason.
 *
 * One entry, and it is the one file that cannot take props: `global-error.tsx` replaces the root
 * layout when the app itself has failed, so it has no Server Component above it to be handed
 * anything by. What it reaches for is `site.contact` and `site.name` — a phone number, an email
 * address and a brand name, none of which is copy and none of which pulls in `src/content/kn`,
 * so no Kannada reaches an English bundle through it. Its own text is bilingual and static
 * (docs/kannada/research/architecture.md §6.14).
 *
 * Nothing else belongs here. An entry is a client bundle that ships copy, and "it is only one
 * label" is how that starts.
 */
const ALLOWED: Readonly<Record<string, string>> = {
  "src/app/global-error.tsx": "no Server Component above it; it reads contact facts, not copy",
};

/** `"use client"` as the first statement, ignoring a leading comment block. */
function isClientModule(source: string): boolean {
  const withoutComments = source.replace(/^\s*(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*\n)*/, "");
  return /^\s*["']use client["']/.test(withoutComments);
}

/** Value imports only. `import type …` and `import { type X }` carry no runtime code. */
function valueImports(source: string): { specifier: string; line: number }[] {
  const found: { specifier: string; line: number }[] = [];
  const pattern = /^[ \t]*import\s+(?!type\s)([\s\S]*?)from\s+["']([^"']+)["']/gm;
  for (const match of source.matchAll(pattern)) {
    const clause = match[1];
    // `import { type A, type B } from …` is entirely types, even without the leading `type`.
    const names = clause.replace(/[{}]/g, "").split(",").map((n) => n.trim()).filter(Boolean);
    if (names.length > 0 && names.every((n) => n.startsWith("type "))) continue;
    found.push({ specifier: match[2], line: source.slice(0, match.index).split("\n").length });
  }
  return found;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

const violations: string[] = [];
let clientModules = 0;

for (const file of walk(SRC)) {
  const source = readFileSync(file, "utf8");
  if (!isClientModule(source)) continue;
  clientModules += 1;
  const relative = path.relative(ROOT, file);
  if (relative in ALLOWED) continue;

  for (const { specifier, line } of valueImports(source)) {
    const rule = FORBIDDEN.find((r) => r.test.test(specifier));
    if (rule) violations.push(`${relative}:${line}  imports ${specifier} — ${rule.why}`);
  }
}

if (violations.length > 0) {
  console.error(`A "use client" module imports copy:\n`);
  for (const line of violations) console.error(`  ${line}`);
  console.error(
    `\nPass the strings in as props from a Server Component, or import the type only\n` +
      `(\`import type { … }\`), which is erased before bundling.\n`,
  );
  process.exit(1);
}

console.log(`${clientModules} "use client" modules checked; none imports a content module.`);
