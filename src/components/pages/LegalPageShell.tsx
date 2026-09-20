import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/ui";
import { PageHero } from "@/components/pages/PageHero";
import { PlaceholderTag } from "@/components/pages/PlaceholderTag";
import { getLegalPage } from "@/content/legal";
import type { LegalPage } from "@/content/types";
import { site } from "@/content/site";
import { showPlaceholders } from "@/lib/env";

/**
 * Shared shell for the three legal notices: the inner-page hero, a draft banner, the prose column
 * and the contact block every notice has to end with. The pages supply only their body.
 *
 * These used to open with a hand-built breadcrumb and title block on the canvas — the one page
 * family that did not look like the rest of the site (owner review round 2, point 13). They now
 * use the same <PageHero> as About, Contact and the audience pages, with the version and effective
 * date in the hero's mono meta line.
 */

/** legalPages is a fixed list, so a missing slug is a build-time mistake, not a runtime branch. */
function requireLegalPage(slug: LegalPage["slug"]): LegalPage {
  const page = getLegalPage(slug);
  if (!page) throw new Error(`No legal page registered for "${slug}" in src/content/legal.ts`);
  return page;
}

/**
 * Typographic rules for hand-written legal copy. There is no typography plugin, so the element
 * styles are applied from here and the pages stay plain HTML.
 */
const prose = [
  "max-w-prose text-body text-ink-2",
  "[&>h2]:mt-12 [&>h2]:font-display [&>h2]:text-h3 [&>h2]:font-bold [&>h2]:text-carbon [&>h2:first-child]:mt-0",
  "[&>h3]:mt-8 [&>h3]:font-display [&>h3]:text-h4 [&>h3]:font-semibold [&>h3]:text-carbon",
  "[&>p]:mt-4",
  "[&>ul]:mt-4 [&>ul]:space-y-2 [&>ul]:pl-5 [&>ul]:list-disc",
  "[&>ol]:mt-4 [&>ol]:space-y-2 [&>ol]:pl-5 [&>ol]:list-decimal",
  "[&_li]:marker:text-green-700",
  "[&_strong]:font-semibold [&_strong]:text-carbon",
  "[&_a]:font-medium [&_a]:text-green-700 [&_a]:underline [&_a]:underline-offset-2",
  "[&_a:hover]:text-teal-900",
].join(" ");

/** "14 May 2027" — en-IN, fixed to UTC so the server and the client render the same string. */
function formatEffectiveDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

type LegalPageShellProps = {
  slug: LegalPage["slug"];
  /** One-sentence summary under the title. Plain English, no legal effect. */
  summary: string;
  children: ReactNode;
};

export function LegalPageShell({ slug, summary, children }: LegalPageShellProps) {
  const page = requireLegalPage(slug);
  const path = `/${page.slug}` as const;

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: page.title, path }]} />

      <PageHero
        current={page.title}
        eyebrow="Legal"
        title={page.title}
        lead={summary}
        /* Each notice's body points the reader here for its version and effective date, so this
           line has to follow `status`: a draft says so, an approved notice prints both.
           types.ts makes an approved page without them a compile error. */
        meta={
          page.status === "approved"
            ? `Version ${page.version} · Effective ${formatEffectiveDate(page.effectiveFrom)}`
            : "Draft version · Effective date to be confirmed"
        }
      />

      {/* A plain <div>: the notice's own heading already names the hero landmark, so a second
          region with the same name would be a duplicate landmark. */}
      <Section as="div" surface="canvas">
        {/* Solar Yellow attention strip (report §6.4): fill, never text, and only outside production. */}
        {showPlaceholders && (
          <p className="mb-12 max-w-prose border-l-4 border-yellow-400 py-1 pl-4 text-small text-ink-2">
            <PlaceholderTag>Draft — pending legal review</PlaceholderTag> Written by the build team as a starting
            point for counsel. It has not been reviewed by a lawyer, and the facts still to be supplied are tagged in
            place.
          </p>
        )}

        <div className={prose}>{children}</div>

        <div className="mt-16 max-w-prose border-t border-mist pt-8">
          <h2 className="font-display text-h4 font-semibold text-carbon">Questions about this page</h2>
          <p className="mt-3 text-body text-ink-2">
            Write to{" "}
            <a
              href={`mailto:${site.contact.email.value}`}
              className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900"
            >
              {site.contact.email.value}
            </a>{" "}
            or call{" "}
            <a
              href={`tel:${site.contact.phonePrimary.value.tel}`}
              className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900"
            >
              {site.contact.phonePrimary.value.display}
            </a>
            . For a privacy request or a complaint, use the{" "}
            <Link
              href="/contact#grievance"
              className="font-medium text-green-700 underline underline-offset-2 hover:text-teal-900"
            >
              grievance and privacy contact
            </Link>{" "}
            on our contact page.
          </p>
        </div>
      </Section>
    </>
  );
}
