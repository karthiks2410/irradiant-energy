import { AccentedTitle } from "@/components/pages/AccentedTitle";
import { QuickQuoteButton } from "@/components/quote/QuickQuote";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { quoteCta } from "@/content/site";
import type { Cta, SectionCopy } from "@/content/types";
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
  copy,
  primary,
  whatsappText,
  showCall = true,
  accentTail = 2,
  siteVisit = false,
}: {
  copy: SectionCopy;
  primary: Pick<Cta, "label" | "href">;
  /** Page-specific WhatsApp prefill; omitted on the hub, which has no approved prefill. */
  whatsappText?: string;
  /** Off on the contact page, where the number is already the subject of the page. */
  showCall?: boolean;
  /**
   * Words of the title that turn green — the brand's two-tone headline, which the audience pages'
   * closing bands were missing while About and Contact each rolled their own. 0 turns it off.
   */
  accentTail?: number;
  /**
   * Adds "Book a free site visit" (opens the quick-quote popup) as an OUTLINE button, so the page
   * still has exactly one filled button. On the audience pages, where a visit is the next step.
   */
  siteVisit?: boolean;
}) {
  return (
    <Section surface="dark" aria-labelledby="closing-cta-heading">
      <SectionHeading
        id="closing-cta-heading"
        align="center"
        eyebrow={copy.eyebrow}
        title={accentTail > 0 ? <AccentedTitle text={copy.title} tail={accentTail} /> : copy.title}
        lead={copy.lead}
      />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href={primary.href} variant="light">
          {primary.label}
        </ButtonLink>
        {siteVisit && (
          <QuickQuoteButton intent="site-visit" variant="outline-light">
            {quoteCta.siteVisitLabel}
          </QuickQuoteButton>
        )}
        <WhatsAppButton text={whatsappText} variant="outline-light" />
      </div>
      {showCall && (
        <div className="mt-6 flex justify-center">
          <CallLink />
        </div>
      )}
    </Section>
  );
}
