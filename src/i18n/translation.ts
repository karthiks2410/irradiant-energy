/**
 * The overlay contract: how a Kannada content module is typed against its English original, and
 * how the two are merged.
 *
 * The English module in `src/content/*` stays the structural and factual source. Kannada is an
 * *overlay* on it — never a second copy — for three reasons:
 *
 * 1. Parity is a compile error, not a review task. `Translation<T>` demands a Kannada string for
 *    every English string, so adding a line to the English copy breaks `tsc` until the Kannada
 *    lands. A renamed key breaks it too (TS2353/TS2561), which a lookup-by-id dictionary cannot.
 * 2. Facts cannot fork. Every locale-neutral field — `href`, `id`, `slug`, `src`, `icon`,
 *    `status`, `source`, numbers — is stripped from the overlay type, so a translator cannot
 *    change a link, a price, an image or a claim's status even by accident. In particular
 *    `status` is English-owned, which is what keeps a "proposed" line proposed in both languages
 *    (docs/kannada/research/architecture.md §6.4, "Status inheritance").
 * 3. The merged value has the *same TypeScript type* as the English module, so page code reads
 *    `content.home.about.copy.title` and never branches on locale.
 *
 * Client-safe: plain types and one pure function, no server imports, so the e2e suite and the
 * generator can both import it.
 */

/**
 * Keys an overlay may never carry.
 *
 * Matched by NAME, at any depth, which is blunt but checkable: a reviewer can read this list and
 * know what a translator can touch. Per-module additions go through the `Fixed` parameter —
 * `src/content/kn/site.ts` adds `value` and `label`, because in `site.ts` those hold a phone
 * number and a social network's name rather than copy.
 *
 * `held` is here because held items never render (content/types.ts); translating withheld copy
 * would be work spent on text no reader can reach.
 */
export const FIXED_KEYS = [
  "href",
  "id",
  "slug",
  "source",
  "status",
  "icon",
  "number",
  "logo",
  "src",
  "domain",
  "comingNext",
  "focal",
  "focalWide",
  "width",
  "height",
  "name",
  "platform",
  "tel",
  "display",
  "image",
  "photos",
  "subject",
  "held",
] as const;

export type FixedKey = (typeof FIXED_KEYS)[number];

type NonTranslatable = number | boolean | bigint | symbol | null | undefined;

/**
 * The Kannada shape for an English value.
 *
 * - a string becomes a string;
 * - a number, boolean or function becomes `never`, and its key is then dropped;
 * - an array maps element-wise, so a tuple keeps its length (a short overlay is TS2322) and a
 *   plain array keeps its element type;
 * - an object keeps the keys that survive, and `-?` makes every one of them REQUIRED. An
 *   optional English key that is actually set would otherwise be silently skippable, which is
 *   the exact failure this type exists to prevent. The cost is that source modules must be
 *   written `as const satisfies T` rather than `const x: T = …`: the annotation erases which
 *   optional keys are present, and `as const` preserves it.
 */
export type Translation<T, Fixed extends string = FixedKey> = T extends string
  ? string
  : T extends NonTranslatable | ((...args: never[]) => unknown)
    ? never
    : T extends readonly unknown[]
      ? { readonly [I in keyof T]: Translation<T[I], Fixed> }
      : {
          readonly [K in keyof T as K extends Fixed
            ? never
            : [Translation<NonNullable<T[K]>, Fixed>] extends [never]
              ? never
              : K]-?: Translation<NonNullable<T[K]>, Fixed>;
        };

/** Where a mismatch was found, for an error message a person can act on. */
const at = (path: string) => (path ? ` at ${path}` : "");

/**
 * Merge an overlay onto an English value and return the English type.
 *
 * The type already rules out most of what could go wrong; this catches what a type cannot see
 * once data crosses a JSON boundary or a generated file drifts from its source:
 * - an array whose length no longer matches (a translator dropped a card);
 * - an overlay key the English side no longer has (a rename that only the generator saw);
 * - a non-string where a string was expected.
 *
 * It throws rather than falling back. A Kannada page that quietly renders one English sentence is
 * worse than a build that stops: the reader cannot tell which lines were translated and which
 * were forgotten (architecture.md §6.4, "Fallback is whole-page only").
 */
export function localize<T>(en: T, kn: unknown, path = ""): T {
  if (kn === undefined) return en;

  if (typeof en === "string") {
    if (typeof kn !== "string") throw new Error(`localize: expected a string${at(path)}`);
    return kn as T;
  }

  // Numbers, booleans, null and functions are English-owned: the overlay type makes them `never`,
  // so anything arriving here is a generator bug rather than a translation.
  if (en === null || typeof en !== "object") return en;

  if (Array.isArray(en)) {
    if (!Array.isArray(kn)) throw new Error(`localize: expected an array${at(path)}`);
    if (kn.length !== en.length) {
      throw new Error(`localize: array length ${kn.length} != ${en.length}${at(path)}`);
    }
    return en.map((item, i) => localize(item, kn[i], `${path}[${i}]`)) as T;
  }

  if (typeof kn !== "object" || kn === null || Array.isArray(kn)) {
    throw new Error(`localize: expected an object${at(path)}`);
  }

  const source = en as Record<string, unknown>;
  const overlay = kn as Record<string, unknown>;
  for (const key of Object.keys(overlay)) {
    if (!(key in source)) throw new Error(`localize: unknown key "${key}"${at(path)}`);
  }

  const merged: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    merged[key] = localize(value, overlay[key], path ? `${path}.${key}` : key);
  }
  return merged as T;
}
