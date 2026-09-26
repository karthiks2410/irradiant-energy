import { Fragment, type ReactNode } from "react";
import { Link } from "@/components/i18n/LocaleLink";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { fillTags, type TagRenderers } from "@/components/quote/template";
import { site } from "@/content/site";
import type { AnalyticsVariant, LegalBlock, LegalSection } from "@/content/types";
import { analyticsEnabled } from "@/lib/analytics";

/**
 * A legal notice's body: its sections as `<h2>`, `<p>` and `<ul>`, in the page's language.
 *
 * The notices are content (src/content/legal/*), not JSX, so the Kannada overlay can replace every
 * sentence while this component keeps the markup. It renders exactly what the hand-written pages
 * did: plain elements with no classes, styled by the prose rules in <LegalPageShell>, which match
 * on direct children — so this returns a fragment, never a wrapper.
 *
 * Sentences are templates (see LegalBlock in src/content/types.ts). `fillTags` turns a `{hole}`
 * into its fact and a `<tag>…</tag>` into its element, wherever the sentence puts them — the
 * email address and the phone number stay links, and Kannada word order is the translator's.
 * A paragraph or list item written as an AnalyticsVariant renders the side that matches this
 * build's `analyticsEnabled`, or nothing when that side is absent.
 *
 * A Server Component: it reads site.ts, which a client component may not import.
 */

type Values = Readonly<Record<string, ReactNode>>;

const { address, email, phonePrimary } = site.contact;
const { entityName, grievanceOfficer } = site.legal;

/** The facts any notice sentence may name. */
const FACTS: Values = {
  siteName: site.name,
  entityName: entityName ?? "",
  email: <a href={`mailto:${email.value}`}>{email.value}</a>,
  phone: <a href={`tel:${phonePrimary.value.tel}`}>{phonePrimary.value.display}</a>,
};

/** The elements a notice sentence may carry. No classes: the shell's prose rules style them. */
const TAGS: TagRenderers = {
  strong: (children) => <strong>{children}</strong>,
  privacyLink: (children) => <Link href="/privacy">{children}</Link>,
  cookieLink: (children) => <Link href="/cookies">{children}</Link>,
  /** "The details are below": the Google Analytics section further down /cookies. */
  gaLink: (children) => <a href="#google-analytics">{children}</a>,
};

/**
 * The form of a sentence this build renders: the sentence itself, or the side of an
 * AnalyticsVariant that matches `analyticsEnabled` — null when that side is absent.
 */
function forThisBuild(entry: string | AnalyticsVariant): string | null {
  if (typeof entry === "string") return entry;
  return analyticsEnabled ? entry.withAnalytics : (entry.withoutAnalytics ?? null);
}

function Block({ block, values }: { block: LegalBlock; values: Values }) {
  const rich = (text: string) => fillTags(text, { values, tags: TAGS });

  if (typeof block === "string") return <p>{rich(block)}</p>;

  if ("items" in block) {
    return (
      <ul>
        {block.items.map((item, index) => {
          const text = forThisBuild(item);
          return text === null ? null : <li key={index}>{rich(text)}</li>;
        })}
      </ul>
    );
  }

  if ("withAnalytics" in block) {
    const text = forThisBuild(block);
    return text === null ? null : <p>{rich(text)}</p>;
  }

  if ("emphasis" in block) {
    return (
      <p>
        <strong>{rich(block.emphasis)}</strong>
      </p>
    );
  }

  if ("contactLines" in block) {
    return (
      <p>
        {address.value.lines.join(", ")}
        {block.contactLines.map((line, index) => (
          <Fragment key={index}>
            <br />
            {rich(line)}
          </Fragment>
        ))}
      </p>
    );
  }

  if ("withEntity" in block) {
    if (entityName) return <p>{rich(block.withEntity)}</p>;
    return (
      <p>
        <PlaceholderTag>{block.pending}</PlaceholderTag> {rich(block.withoutEntity)}
      </p>
    );
  }

  if ("grievanceFallback" in block) {
    // The officer's name and address are facts, not copy: nothing on this line is translated.
    if (grievanceOfficer) {
      return (
        <p>
          {grievanceOfficer.name} — <a href={`mailto:${grievanceOfficer.email}`}>{grievanceOfficer.email}</a>
        </p>
      );
    }
    return (
      <p>
        <PlaceholderTag>{block.pending}</PlaceholderTag> {rich(block.grievanceFallback)}
      </p>
    );
  }

  return (
    <p>
      <PlaceholderTag>{block.pending}</PlaceholderTag> {rich(block.text)}
    </p>
  );
}

export function LegalBody({
  sections,
  values,
  after,
}: {
  sections: readonly LegalSection[];
  /** The page's own `{holes}` on top of the shared facts, e.g. the consent cookie's name. */
  values?: Values;
  /** Rendered straight after the section whose `id` is the key: the cookie settings panel. */
  after?: Readonly<Record<string, ReactNode>>;
}) {
  const all = { ...FACTS, ...values };
  return sections.map((section, index) => (
    <Fragment key={index}>
      <h2 id={section.id}>{section.heading}</h2>
      {section.body.map((block, blockIndex) => (
        <Block key={blockIndex} block={block} values={all} />
      ))}
      {section.id ? after?.[section.id] : null}
    </Fragment>
  ));
}
