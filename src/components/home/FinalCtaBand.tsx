import { ButtonLink, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { faqCardLabels } from "@/content/solutions";
import { isConfirmed, site, whatsappLink } from "@/content/site";
import { AccentTitle } from "./AccentTitle";

const { finalCta } = homePage;

// Owner instruction (site.ts): no hours line and no availability claim anywhere on the site.
const phone = isConfirmed(site.contact.phonePrimary.status) ? site.contact.phonePrimary.value : null;

const quietLink =
  "inline-flex min-h-11 items-center text-ui font-medium text-white underline decoration-white/40 underline-offset-4 transition-colors duration-200 hover:decoration-white";

/** Closing band: the two page CTAs plus the direct lines for visitors who would rather talk. */
export function FinalCtaBand() {
  return (
    <Section surface="dark" aria-labelledby="final-cta-heading">
      <Reveal>
        <SectionHeading
          id="final-cta-heading"
          align="center"
          eyebrow={finalCta.copy.eyebrow}
          eyebrowTone="signal"
          title={<AccentTitle text={finalCta.copy.title} />}
          lead={finalCta.copy.lead}
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
              {faqCardLabels.whatsappLabel}
            </a>
          </li>
          {phone && (
            <li>
              {/* The number is the link text, so the destination is never ambiguous. */}
              <a href={`tel:${phone.tel}`} className={quietLink}>
                Call {phone.display}
              </a>
            </li>
          )}
        </ul>
      </Reveal>
    </Section>
  );
}
