import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import type { Cta, SectionCopy } from "@/content/types";
import { CallLink, WhatsAppButton } from "./Contact";

/**
 * Closing band (inventory P-SG-6): one filled primary, then WhatsApp and phone — the CTA
 * hierarchy in report §11.1. No second filled button anywhere on the page.
 */
export function ClosingCtaBand({
  copy,
  primary,
  whatsappText,
}: {
  copy: SectionCopy;
  primary: Pick<Cta, "label" | "href">;
  /** Page-specific WhatsApp prefill; omitted on the hub, which has no approved prefill. */
  whatsappText?: string;
}) {
  return (
    <Section surface="dark" aria-labelledby="closing-cta-heading">
      <SectionHeading
        id="closing-cta-heading"
        align="center"
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
      />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href={primary.href} variant="light">
          {primary.label}
        </ButtonLink>
        <WhatsAppButton text={whatsappText} variant="outline-light" />
      </div>
      <div className="mt-6 flex justify-center">
        <CallLink />
      </div>
    </Section>
  );
}
