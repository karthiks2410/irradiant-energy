/**
 * Generate the Kannada content overlays in `src/content/kn/` from the reviewers' JSON.
 *
 *   npm run build:kn            write the overlays
 *   npm run build:kn -- --check fail if anything is out of date (CI, pre-commit)
 *
 * Why a generator and not hand-written files: the Kannada copy is still being edited by
 * reviewers in `docs/kannada/translations/kn-*.json`, one row per unique English string. Pasting
 * those rows into TypeScript would fork them the moment a reviewer changes a word, and nobody
 * would know which side was current. So the JSON stays the source, and every `src/content/kn/*`
 * file is disposable output: delete the folder, run this, get the same bytes back.
 *
 * How a row finds its slot: BY ENGLISH TEXT. `units.json` guarantees one row per unique English
 * string (641 rows, no duplicate `text`), so the English module is walked and each string leaf is
 * looked up by its own value. That is why no id map is needed and why the generator survives a
 * refactor of the content modules: rename a key, move a section, and the same English sentence
 * still finds the same Kannada. What it cannot do is give one English string two Kannada
 * renderings — see COLLISIONS below.
 *
 * What is NOT emitted: every key in `FIXED_KEYS` (src/i18n/translation.ts) plus the per-module
 * additions in `MODULES`. Hrefs, ids, slugs, icons, image sources, numbers, `source` and `status`
 * are English-owned, so a translation can never move a link or quietly downgrade a claim from
 * "proposed" to approved.
 *
 * Node 24 runs TypeScript directly, so the English modules are imported as they are. The resolve
 * hook below is only there to teach Node the `@/*` alias and extensionless imports that
 * tsconfig.json and the bundler already understand.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const SRC = path.join(ROOT, "src");
const OUT_DIR = path.join(SRC, "content/kn");
const TRANSLATIONS = path.join(ROOT, "docs/kannada/translations");

registerHooks({
  resolve(specifier, context, nextResolve) {
    let spec = specifier;
    if (spec.startsWith("@/")) spec = pathToFileURL(path.join(SRC, spec.slice(2))).href;
    if (spec.startsWith("file://") || spec.startsWith(".")) {
      const url = spec.startsWith("file://") ? spec : new URL(spec, context.parentURL).href;
      const file = fileURLToPath(url);
      if (!existsSync(file)) {
        for (const candidate of [`${file}.ts`, path.join(file, "index.ts")]) {
          if (existsSync(candidate)) return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
      return { url, shortCircuit: true };
    }
    return nextResolve(spec, context);
  },
});

const { FIXED_KEYS } = await import(pathToFileURL(path.join(SRC, "i18n/translation.ts")).href);
const FIXED = new Set<string>(FIXED_KEYS);

// ---------------------------------------------------------------------------------------------
// The reviewers' rows
// ---------------------------------------------------------------------------------------------

interface Row {
  /** The English string, verbatim. It is the join key. */
  en: string;
  kn: string;
  /**
   * The run of `kn` that renders in the accent green. Empty for strings that are not headings.
   * It replaces the old "colour the last N words" rule, which paints the verb in Kannada.
   */
  accentPhrase: string;
}

function loadRows(): Map<string, Row> {
  const units: { unit: string; text: string }[] = JSON.parse(
    readFileSync(path.join(TRANSLATIONS, "units.json"), "utf8"),
  );
  const byUnit = new Map<string, Row>();
  for (const file of readdirSync(TRANSLATIONS).filter((f) => /^kn-.*\.json$/.test(f)).sort()) {
    for (const row of JSON.parse(readFileSync(path.join(TRANSLATIONS, file), "utf8")) as (Row & { unit: string })[]) {
      byUnit.set(row.unit, row);
    }
  }

  const byText = new Map<string, Row>();
  for (const unit of units) {
    const row = byUnit.get(unit.unit);
    if (!row) continue;
    // The reviewers edit kn-*.json by hand; a drifted `en` means the row no longer describes the
    // string it is filed under, and matching it by text would put the wrong Kannada on the page.
    if (row.en !== unit.text) throw new Error(`${unit.unit}: "en" no longer matches units.json`);
    byText.set(unit.text, row);
  }
  return byText;
}

// ---------------------------------------------------------------------------------------------
// What to generate
// ---------------------------------------------------------------------------------------------

interface ModuleSpec {
  /** File written under src/content/kn/. */
  file: string;
  /** Module the English value comes from, as the generated file will import it. */
  from: string;
  /** Exported English binding. */
  en: string;
  /** Exported Kannada binding. */
  kn: string;
  /** Keys this module treats as English-owned on top of FIXED_KEYS, with the reason. */
  fixed?: readonly string[];
  why: string;
}

const MODULES: readonly ModuleSpec[] = [
  {
    file: "home.ts",
    from: "@/content/home",
    en: "homePage",
    kn: "homePage",
    why: "Home page copy.",
  },
  {
    file: "site.ts",
    from: "@/content/site",
    en: "site",
    kn: "site",
    // `contact`, `legal` and `social` are facts and proper names: phone numbers, the registered
    // entity, the grievance officer, and the networks' own names. `legacyName` is the old
    // business's name, which is a name in any language.
    fixed: ["contact", "legal", "social", "legacyName"],
    why: "Business facts stay English-owned; only the tagline and the site description are copy.",
  },
  {
    file: "nav.ts",
    from: "@/content/site",
    en: "nav",
    kn: "nav",
    why: "Header, footer and mobile-sheet navigation. `solutions` is nav[2], so it is not overlaid twice.",
  },
  {
    file: "primary-cta.ts",
    from: "@/content/site",
    en: "primaryCta",
    kn: "primaryCta",
    why: "The site-wide CTA, quoted by the header, the footer and three home bands.",
  },
  {
    file: "social-pending.ts",
    from: "@/content/site",
    en: "socialPending",
    kn: "socialPending",
    // The network's own name is a name in any language; only the reason it is not a link is copy.
    fixed: ["label"],
    why: 'Profiles shown but not linked yet: the "coming soon" note is read out as part of the accessible name.',
  },
  {
    file: "images.ts",
    from: "@/content/images",
    en: "projectImages",
    kn: "projectImages",
    why: "Alt text. The file, its dimensions and its focal point are the same picture in both locales.",
  },
  {
    file: "faq-home.ts",
    from: "@/content/faq-home",
    en: "homeFaq",
    kn: "homeFaq",
    why: "The five home-page questions, which are lifted from the Homes page so the wording has one source.",
  },
  {
    file: "faq-card-labels.ts",
    from: "@/content/solutions/shared",
    en: "faqCardLabels",
    kn: "faqCardLabels",
    why: 'The two buttons on the "Still have questions?" card, also used by the home page\'s closing band.',
  },
  {
    file: "ui.ts",
    from: "@/content/ui",
    en: "ui",
    kn: "ui",
    why: "Chrome, control names and accessible names.",
  },
];

/**
 * English strings that stay English, by path, each with the reason.
 *
 * Every one of these is a string the string inventory does not cover, because nothing renders it.
 * The list is deliberately short and deliberately explicit: a new entry is a decision someone has
 * to write down, not a silent fallback. `kn-parity.test.ts` asserts the list, so it cannot grow
 * by accident, and the generator fails on any untranslated string that is NOT on it.
 */
const UNTRANSLATED: Readonly<Record<string, string>> = {
  "homePage.audiencePaths.items[0].tile": "legacy home-hero tile; no component renders `tile`",
  "homePage.audiencePaths.items[1].tile": "legacy home-hero tile; no component renders `tile`",
  "homePage.audiencePaths.items[2].tile": "legacy home-hero tile; no component renders `tile`",
  "homePage.about.caption": "prototype caption; the rebuilt about band does not render it",
  "homePage.calculator.fields.tariff.label": "input withdrawn at owner review round 2; kept for the engine's API",
  "homePage.calculator.fields.tariff.hint": "input withdrawn at owner review round 2; kept for the engine's API",
  "projectImages.duskSkyline.alt": "hero slide 1: decoration behind fixed copy, rendered with alt=\"\"",
  "ui.calculator.flags.kwh-clamped": "the kWh input is not offered, so the engine cannot raise this flag here",
};

// ---------------------------------------------------------------------------------------------
// Emitting
// ---------------------------------------------------------------------------------------------

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * Characters that are invisible in an editor: NBSP, the zero-width and bidi controls, the line
 * and paragraph separators, and the BOM.
 *
 * Built from code points rather than written as a literal, so this file itself never contains
 * one — a zero-width joiner inside the escaping routine would be a fine joke and a bad bug.
 */
const INVISIBLE = new RegExp(
  `[\\u00a0\\u200b-\\u200f\\u2028\\u2029\\ufeff]`,
  "g",
);

/**
 * Quote a string for TypeScript, escaping the invisible characters Kannada needs.
 *
 * ZWNJ and ZWJ decide where a conjunct breaks, so they are load-bearing in words like
 * ಅಪಾರ್ಟ್‌ಮೆಂಟ್ — and they are invisible in an editor and survive a careless copy-paste as
 * nothing at all. Escaping them keeps a reviewer able to see that they are there.
 */
function quote(value: string): string {
  const json = JSON.stringify(value);
  return json.replace(INVISIBLE, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

const key = (name: string) => (IDENTIFIER.test(name) ? name : quote(name));

class Generator {
  readonly missing: string[] = [];
  readonly unusedAllowlist = new Set(Object.keys(UNTRANSLATED));
  readonly rows: Map<string, Row>;

  constructor(rows: Map<string, Row>) {
    this.rows = rows;
  }

  /** The Kannada for an English string, or the English itself when the path is allow-listed. */
  private translate(text: string, at: string): string {
    const row = this.rows.get(text);
    if (row) return row.kn;
    if (at in UNTRANSLATED) {
      this.unusedAllowlist.delete(at);
      return text;
    }
    this.missing.push(`${at}: ${JSON.stringify(text)}`);
    return text;
  }

  /**
   * The accent run for a heading.
   *
   * The reviewers attach it to the heading's own row, so it is read from the sibling `title`
   * rather than looked up as a string of its own — `accent` is a substring of the title and has
   * no row. An empty or non-matching phrase is fatal: the headline would render with no emphasis
   * at all, or with the wrong half of it green.
   */
  private accent(siblings: Record<string, unknown>, at: string): string {
    const title = siblings.title;
    if (typeof title !== "string") throw new Error(`${at}: "accent" with no sibling "title"`);
    const row = this.rows.get(title);
    if (!row) {
      this.missing.push(`${at}: no row for the title it accents`);
      return "";
    }
    if (!row.accentPhrase) throw new Error(`${at}: the row for "${title}" has an empty accentPhrase`);
    if (!row.kn.includes(row.accentPhrase)) {
      throw new Error(`${at}: accentPhrase "${row.accentPhrase}" is not part of the Kannada title`);
    }
    return row.accentPhrase;
  }

  /** Walk an English value and emit the overlay literal, or null when nothing survives. */
  emit(value: unknown, at: string, indent: string, fixed: Set<string>, siblings?: Record<string, unknown>): string | null {
    if (typeof value === "string") {
      const kannada = at.endsWith(".accent") && siblings ? this.accent(siblings, at) : this.translate(value, at);
      return quote(kannada);
    }
    if (value === null || typeof value !== "object" || typeof value === "function") return null;

    const inner = `${indent}  `;
    if (Array.isArray(value)) {
      // Length is part of the contract: `Translation<T>` maps tuples element-wise, so a dropped
      // item is a compile error rather than a short list on the page.
      const items = value.map((item, i) => this.emit(item, `${at}[${i}]`, inner, fixed) ?? "undefined");
      if (items.length === 0) return "[]";
      return `[\n${items.map((item) => `${inner}${item},`).join("\n")}\n${indent}]`;
    }

    const record = value as Record<string, unknown>;
    const lines: string[] = [];
    for (const [name, child] of Object.entries(record)) {
      if (FIXED.has(name) || fixed.has(name)) continue;
      const emitted = this.emit(child, at ? `${at}.${name}` : name, inner, fixed, record);
      if (emitted === null) continue;
      lines.push(`${inner}${key(name)}: ${emitted},`);
    }
    if (lines.length === 0) return null;
    return `{\n${lines.join("\n")}\n${indent}}`;
  }
}

// ---------------------------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------------------------

const check = process.argv.includes("--check");

// `docs/` is not in the repository (it is the working folder for the redesign), so the source
// rows are only on a machine that has them. The generated overlays ARE committed, which is what
// lets the build, the type check and kn-parity.test.ts run anywhere. Without the rows there is
// nothing to compare against, so say so and stop rather than fail a CI run.
if (!existsSync(TRANSLATIONS)) {
  console.log(`${path.relative(ROOT, TRANSLATIONS)} is not present; skipping (the overlays in src/content/kn are committed).`);
  process.exit(0);
}

const rows = loadRows();
const generator = new Generator(rows);
const written: { file: string; body: string }[] = [];

for (const spec of MODULES) {
  const loaded = await import(pathToFileURL(path.join(SRC, `${spec.from.slice(2)}.ts`)).href);
  const english = loaded[spec.en];
  if (english === undefined) throw new Error(`${spec.from} has no export "${spec.en}"`);

  const fixed = new Set(spec.fixed ?? []);
  const literal = generator.emit(english, spec.en, "", fixed);
  if (literal === null) throw new Error(`${spec.file}: nothing to translate`);

  const extra = spec.fixed?.length ? ` | ${spec.fixed.map((k) => `"${k}"`).join(" | ")}` : "";
  // The English binding is imported under a fixed alias: the overlay is exported under the same
  // name as its English original, so importing it unaliased would shadow it.
  const type = `Translation<typeof english${extra ? `, FixedKey${extra}` : ""}>`;
  const typeImport = extra ? `import type { FixedKey, Translation }` : `import type { Translation }`;

  const body =
    `// GENERATED FILE — do not edit. Written by scripts/build-kn-content.ts from\n` +
    `// docs/kannada/translations/kn-*.json. Regenerate with \`npm run build:kn\`.\n` +
    `//\n` +
    `// ${spec.why}\n` +
    `//\n` +
    `// Every key here is checked against the English module at compile time: a string the English\n` +
    `// side has and this file does not is a type error, and so is a key that no longer exists.\n` +
    `// Locale-neutral fields (href, id, slug, src, icon, status, source, numbers) are absent by\n` +
    `// construction — see FIXED_KEYS in src/i18n/translation.ts.\n` +
    `\n` +
    `import { ${spec.en} as english } from "${spec.from}";\n` +
    `${typeImport} from "@/i18n/translation";\n` +
    `\n` +
    `export const ${spec.kn} = ${literal} satisfies ${type};\n`;

  written.push({ file: path.join(OUT_DIR, spec.file), body });
}

if (generator.missing.length > 0) {
  console.error(`No Kannada row for ${generator.missing.length} string(s):\n`);
  for (const line of generator.missing) console.error(`  ${line}`);
  console.error(
    `\nEither the reviewers have not translated it yet (add it to docs/kannada/translations/),\n` +
      `or nothing renders it — in which case add its path to UNTRANSLATED in this script with a reason.\n`,
  );
  process.exit(1);
}
if (generator.unusedAllowlist.size > 0) {
  console.error(
    `UNTRANSLATED lists ${generator.unusedAllowlist.size} path(s) that no longer exist or are now translated:\n` +
      [...generator.unusedAllowlist].map((p) => `  ${p}`).join("\n") +
      `\nRemove them from this script.\n`,
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
let stale = 0;
for (const { file, body } of written) {
  const current = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (current === body) continue;
  if (current !== null && !current.startsWith("// GENERATED FILE")) {
    throw new Error(`${path.relative(ROOT, file)} is not a generated file; refusing to overwrite it`);
  }
  stale += 1;
  if (check) {
    console.error(`out of date: ${path.relative(ROOT, file)}`);
    continue;
  }
  writeFileSync(file, body);
  console.log(`wrote ${path.relative(ROOT, file)}`);
}

if (check && stale > 0) {
  console.error(`\n${stale} file(s) out of date. Run \`npm run build:kn\` and commit the result.`);
  process.exit(1);
}
console.log(
  check
    ? `src/content/kn is up to date (${written.length} modules).`
    : `${written.length} modules, ${stale} changed.`,
);
