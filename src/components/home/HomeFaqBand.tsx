import { Link } from "@/components/i18n/LocaleLink";
import { Accordion, ArrowRightIcon, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { homeFaq } from "@/content/faq-home";

/** Answers are stored as plain text with blank lines between paragraphs (content/types.ts). */
const answer = (text: string) =>
  text.split("\n\n").map((paragraph) => (
    <p key={paragraph} className="not-first:mt-4">
      {paragraph}
    </p>
  ));

const items = homeFaq.items.map((faq) => ({ id: faq.id, question: faq.q, answer: answer(faq.a) }));

/**
 * Five questions lifted from the Homes page so the wording has one source. The JSON-LD
 * mirrors exactly what is rendered, which is Google's condition for FAQ markup even
 * though it no longer earns a rich result.
 */
export function HomeFaqBand() {
  return (
    <Section surface="white" aria-labelledby="faq-heading">
      <Reveal>
        <SectionHeading
          id="faq-heading"
          align="stacked"
          title={homeFaq.copy.title}
          lead={homeFaq.copy.lead}
        />

        <div className="mt-12 grid-page">
          <div className="col-span-4 md:col-span-8 lg:col-span-10">
            <Accordion single items={items} defaultOpen={[items[0].id]} />

            <Link
              href={homeFaq.moreLink.href}
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-ui font-semibold text-green-700 transition-colors duration-200 hover:text-teal-900"
            >
              {homeFaq.moreLink.label}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </Reveal>

      <FaqJsonLd faqs={homeFaq.items.map((faq) => ({ question: faq.q, answer: faq.a }))} />
    </Section>
  );
}
