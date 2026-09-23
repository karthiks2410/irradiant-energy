import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import type { Cta, SectionCopy } from "@/content/types";
import type { Content } from "@/i18n/content";
import { CallLink, WhatsAppButton } from "./Contact";

/**
 * The band every page ends on (inventory P-SG-6): one filled primary, then WhatsApp and phone —
 * the CTA hierarchy in report §11.1. No second filled button anywhere on a page.
 *
 * About and Contact used to hand-roll their own closing band, so the three endings drifted apart
 * in spacing and in which routes they offered (owner review round 2, point 13). They all come
 * through here now; what differs between pages is the copy, which each page owns, not the shape.
 */
export function ClosingCtaBand({
  content,
  copy,
  primary,
  whatsappText,
  showCall = true,
}: {
  /** The merged content for this locale; the band reads the two button labels from it. */
  content: Content;
  copy: SectionCopy;
  primary: Pick<Cta, "label" | "href">;
  /** Page-specific WhatsApp prefill; omitted on the hub, which has no approved prefill. */
  whatsappText?: string;
  /** Off on the contact page, where the number is already the subject of the page. */
  showCall?: boolean;
}) {
  return (
    <Section surface="dark" aria-labelledby="closing-cta-heading">
      <SectionHeading
        id="closing-cta-heading"
        align="center"
        eyebrow={copy.eyebrow}
        // The brand's two-tone headline. `accent` names the green run outright; the `tail` below
        // is the old last-two-words rule, kept only as the fallback for copy that has no accent.
        title={<AccentedTitle text={copy.title} tail={2} accent={copy.accent} />}
        lead={copy.lead}
      />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href={primary.href} variant="light">
          {primary.label}
        </ButtonLink>
        <WhatsAppButton text={whatsappText} label={content.faqCardLabels.whatsappLabel} variant="outline-light" />
      </div>
      {showCall && (
        <div className="mt-6 flex justify-center">
          <CallLink label={content.faqCardLabels.callLabel} />
        </div>
      )}
    </Section>
  );
}
