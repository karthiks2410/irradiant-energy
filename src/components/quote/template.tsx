/**
 * Templates that carry markup: "…have read the <privacy>privacy notice</privacy>."
 *
 * `fill`/`fillParts` (src/i18n/format.ts) handle a `{hole}`. This handles the other half of the
 * problem: a sentence with a LINK or an accented run inside it. Splitting such a sentence into
 * "I agree … read the", "privacy notice" and "." would hand a translator three fragments and no
 * sentence, and Kannada would need them in a different order anyway. So the reviewers get one
 * row with the tag in it, and this turns the tag back into an element.
 *
 * Only what the copy actually uses is supported: one level of tags, no nesting, no attributes.
 * A tag with no renderer, or a hole with no value, is left as written — visible, rather than
 * silently dropped.
 *
 * ## Why `spacing`
 *
 * React's SSR writes a `<!-- -->` between two adjacent TEXT children, so `read the{" "}<Link>`
 * emits `read the<!-- --> <a…>` while `read the <Link>` emits `read the <a…>`. Both are the same
 * page to a reader and different bytes on the wire. The JSX these templates replace was written
 * both ways, and this build's rule is that English output does not move — so the call site says
 * which shape its markup had, and a diff of the built HTML proves it did not change. It is a
 * transitional detail, not a choice anyone should have to make about new copy.
 */

import { Fragment, type ReactNode } from "react";

/** `{name}` or `<tag>…</tag>`. */
const TOKEN = /\{(\w+)\}|<(\w+)>([\s\S]*?)<\/\2>/g;

/** Partial, because a template may carry a tag this call site does not render. */
export type TagRenderers = Readonly<Partial<Record<string, (children: ReactNode) => ReactNode>>>;

export interface FillTagsOptions {
  /** `{name}` values. A ReactNode, so a live figure can sit inside a sentence. */
  values?: Readonly<Record<string, ReactNode>>;
  /** `<tag>` renderers, by tag name. */
  tags?: TagRenderers;
  /**
   * How a space next to an element is handed to React.
   *
   * - `"inline"` leaves it in its text run, as `read the <Link>` in JSX does;
   * - `"detach"` gives it its own child, as `read the{" "}<Link>` does.
   *
   * See the note above: it exists to keep already-shipped English markup byte-for-byte.
   */
  spacing?: "inline" | "detach";
}

/**
 * The template as React children.
 *
 * Elements are wrapped in a keyed Fragment — React wants a key for an array child, and a
 * Fragment adds no markup of its own.
 */
export function fillTags(template: string, options: FillTagsOptions = {}): ReactNode[] {
  const { values = {}, tags = {}, spacing = "inline" } = options;
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;

  /** `afterNode` / `beforeNode` say which ends of this run touch an element. */
  const pushText = (text: string, afterNode: boolean, beforeNode: boolean) => {
    if (!text) return;
    if (spacing === "inline") {
      out.push(text);
      return;
    }
    let body = text;
    const lead = afterNode && body.startsWith(" ");
    if (lead) body = body.slice(1);
    const trail = beforeNode && body.endsWith(" ");
    if (trail) body = body.slice(0, -1);
    if (lead) out.push(" ");
    if (body) out.push(body);
    if (trail) out.push(" ");
  };

  for (const match of template.matchAll(TOKEN)) {
    const start = match.index;
    pushText(template.slice(last, start), last > 0, true);
    last = start + match[0].length;

    const [, hole, tag, inner] = match;
    if (hole !== undefined) {
      const value = hole in values ? values[hole] : match[0];
      out.push(typeof value === "string" || typeof value === "number" ? value : <Fragment key={index++}>{value}</Fragment>);
      continue;
    }
    const render = tags[tag];
    // The inner text can carry holes of its own: "<tel>{phone}</tel>".
    const children = render ? fillTags(inner, { values, tags }) : null;
    out.push(render ? <Fragment key={index++}>{render(children)}</Fragment> : match[0]);
  }

  pushText(template.slice(last), last > 0, false);
  return out;
}
