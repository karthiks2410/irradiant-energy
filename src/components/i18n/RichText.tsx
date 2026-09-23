import { Fragment, type ReactNode } from "react";
import { fill, type TemplateValues } from "@/i18n/format";

/**
 * Render a sentence that has markup *inside* it — a link, an emphasised opening, a cookie's name
 * in `<code>` — without putting the markup in the content.
 *
 * `<Template>` (./Template.tsx) covers the case where a value drops into a hole. This covers the
 * case where an ELEMENT does: "More detail in our <cookieLink>cookie notice</cookieLink> and
 * <privacyLink>privacy notice</privacyLink>." The content stores the named slot; the component
 * decides what a `cookieLink` is — which href it points at, which classes it carries, whether it
 * closes the dialog on the way out. A translator moves the link to wherever the Kannada sentence
 * wants it and cannot touch any of that.
 *
 * The alternative is what the consent UI did before: the sentence broken into three JSX children
 * with the link welded into the middle. That hard-codes English word order, and Kannada puts the
 * link at the end of the clause, not the middle.
 *
 * `{placeholder}` holes are filled here too, inside the slots as well as around them, so
 * `<code>{cookieName}</code>` works.
 *
 * Not a client module: it is a pure function of its props, so it renders on the server inside a
 * Server Component and inside a client island alike.
 */

/** Named slots the template may use. The key is the tag name; the value renders its inner text. */
export type RichSlots = Readonly<Record<string, (inner: string) => ReactNode>>;

/**
 * `<name>inner</name>`, where the closing tag must match the opening one (the backreference).
 * Deliberately not a parser: slots do not nest and do not carry attributes, which is what keeps a
 * translated string from being able to introduce markup of its own.
 */
const SLOT = /<([A-Za-z][\w-]*)>([\s\S]*?)<\/\1>/g;

export function RichText({
  text,
  values = {},
  slots,
}: {
  text: string;
  values?: TemplateValues;
  slots: RichSlots;
}) {
  const parts: ReactNode[] = [];
  let last = 0;

  for (const match of text.matchAll(SLOT)) {
    const [whole, name, inner] = match;
    const render = slots[name];
    // Loud rather than lenient: a slot the component does not know would otherwise render as
    // visible angle brackets, or silently drop the words between them.
    if (!render) throw new Error(`RichText: no slot named "${name}" in ${JSON.stringify(text)}`);
    if (match.index > last) parts.push(fill(text.slice(last, match.index), values));
    parts.push(render(fill(inner, values)));
    last = match.index + whole.length;
  }
  if (last < text.length) parts.push(fill(text.slice(last), values));

  // Separate children rather than one joined node, for the same reason <Template> does it: React
  // writes a `<!-- -->` separator between adjacent text children, and the English markup around
  // these sentences already has those separators.
  return parts.map((part, index) => <Fragment key={index}>{part}</Fragment>);
}
