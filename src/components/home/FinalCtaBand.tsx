import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { Template } from "@/components/i18n/Template";
import { isConfirmed, whatsappLink } from "@/content/site";
import type { Content } from "@/i18n/content";
import { AccentTitle } from "./AccentTitle";

const quietLink =
  "inline-flex min-h-11 items-center text-ui font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors duration-200 hover:decoration-white";

/** Closing band: the two page CTAs plus the direct lines for visitors who would rather talk. */
export function FinalCtaBand({ content }: { content: Content }) {
  const { finalCta } = content.home;
  const { contact } = content.site;
  // Owner instruction (site.ts): no hours line and no availability claim anywhere on the site.
  const phone = isConfirmed(contact.phonePrimary.status) ? contact.phonePrimary.value : null;

  return (
    <Section surface="dark" aria-labelledby="final-cta-heading">
      <Reveal>
        <SectionHeading
          id="final-cta-heading"
          align="center"
          eyebrow={finalCta.copy.eyebrow}
          eyebrowTone="signal"
          title={<AccentTitle text={finalCta.copy.title} accent={finalCta.copy.accent} />}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={finalCta.primary.href} variant="light">
            {finalCta.primary.label}
          </ButtonLink>
          <ButtonLink href={finalCta.secondary.href} variant="outline-light">
            {finalCta.secondary.label}
          </ButtonLink>
        </div>

        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
          <li>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={quietLink}>
              {content.faqCardLabels.whatsappLabel}
            </a>
          </li>
          {phone && (
            <li>
              {/* The number is the link text, so the destination is never ambiguous. */}
              <a href={`tel:${phone.tel}`} className={quietLink}>
                <Template text={content.ui.home.finalCtaCall} values={{ phone: phone.display }} />
              </a>
            </li>
          )}
        </ul>
      </Reveal>
    </Section>
  );
}
