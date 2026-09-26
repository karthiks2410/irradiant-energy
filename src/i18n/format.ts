/**
 * `{placeholder}` templates.
 *
 * A Kannada sentence is not an English sentence with the nouns swapped: the verb moves to the
 * end, and a phone number or a brand name lands in a different place in the line. So any string
 * that interpolates a value is stored as a template with named holes — "Call {phone}",
 * "{groupLabel} · Rooftop solar" — and each locale decides where the holes go.
 *
 * Two forms, because JSX and attributes need different things:
 * - `fill` returns one string, for `aria-label`, `title`, a WhatsApp prefill or a document title;
 * - `fillParts` returns the pieces, for JSX.
 *
 * `fillParts` exists so English markup does not move. React's SSR writes a `<!-- -->` separator
 * between two adjacent text children, so `Call {phone.display}` in JSX emits
 * `Call <!-- -->+91 98457 94343`. Collapsing that to one interpolated string would delete the
 * separator and change bytes on an English page for no reason. Handing the pieces back as
 * separate children keeps the same child sequence — and gives Kannada its own order for free.
 *
 * Client-safe: no imports, no JSX.
 */

export type TemplateValues = Readonly<Record<string, string | number>>;

const PLACEHOLDER = /\{(\w+)\}/g;

/** Substitute `{name}` from `values`. An unknown name is left as written, so it is visible. */
export function fill(template: string, values: TemplateValues): string {
  return template.replace(PLACEHOLDER, (whole, key: string) => {
    const value = values[key];
    return value === undefined ? whole : String(value);
  });
}

/**
 * The same substitution, returned as the pieces between the holes.
 *
 * Empty pieces are dropped — a template that starts or ends with a placeholder would otherwise
 * contribute an empty text child, which React renders as nothing but which changes the child
 * count. The result is never empty: a template with no text at all returns `[""]`.
 */
export function fillParts(template: string, values: TemplateValues): string[] {
  const parts: string[] = [];
  let last = 0;
  for (const match of template.matchAll(PLACEHOLDER)) {
    const key = match[1];
    const start = match.index;
    if (start > last) parts.push(template.slice(last, start));
    const value = values[key];
    parts.push(value === undefined ? match[0] : String(value));
    last = start + match[0].length;
  }
  if (last < template.length) parts.push(template.slice(last));
  const kept = parts.filter((part) => part !== "");
  return kept.length > 0 ? kept : [""];
}

/** The `{name}` keys a template uses, for the test that checks both locales agree on them. */
export function placeholdersIn(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
}

/**
 * `<name>…</name>` markup slots, the same idea one level up: a few sentences carry an inline
 * element rather than a value — a link, an emphasised opening, a cookie name in `<code>` — and
 * <RichText> (src/components/i18n/RichText.tsx) substitutes the element for the tag.
 *
 * Exported here, beside `placeholdersIn`, so kn-parity.test.ts can assert that a translated
 * sentence still carries the same slots. A dropped `<privacyLink>` would quietly lose a link a
 * consent notice is required to offer, and an invented tag throws at render.
 */
const MARKUP_SLOT = /<([A-Za-z][\w-]*)>[\s\S]*?<\/\1>/g;

export function slotsIn(template: string): string[] {
  return [...template.matchAll(MARKUP_SLOT)].map((m) => m[1]).sort();
}
