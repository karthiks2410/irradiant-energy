import { Accordion, Card, Eyebrow, Section } from "@/components/ui";
import type { FaqSection } from "@/content/types";
import { CallLink, WhatsAppButton } from "./Contact";
import { FaqAnswer } from "./FaqAnswer";

/** Anchor the home page's FAQ teaser links to (src/content/faq-home.ts `moreLink`). */
const faqAnchor = "faq";

/** Anchor for a single question, e.g. #faq-h-2. */
const faqItemId = (id: string) => `faq-${id.toLowerCase()}`;

/**
 * Audience-page FAQs: every verified question for the segment, as one list. Answers are
 * server-rendered inside the disclosure panels, so the FAQ structured data mirrors visible text.
 */
export function SegmentFaq({ faq }: { faq: FaqSection }) {
  const { copy, groups, stillHaveQuestions } = faq;
  const items = groups.flatMap((group) => group.items);

  return (
    <Section surface="white" id={faqAnchor} aria-labelledby="faq-heading">
      <div className="grid-page gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)]">
            {copy.eyebrow && <Eyebrow className="mb-4">{copy.eyebrow}</Eyebrow>}
            <h2 id="faq-heading" className="font-display text-h2 font-bold">
              {copy.title}
            </h2>
            {copy.lead && <p className="mt-5 text-lead text-ink-2">{copy.lead}</p>}

            {/* Deep Teal tile: data-surface switches the card, its buttons and the focus ring. */}
            <div data-surface="dark" className="mt-8">
              <Card padding="lg">
                <h3 className="font-display text-h3 font-semibold">{stillHaveQuestions.title}</h3>
                <p className="mt-2 text-body text-white/80">{stillHaveQuestions.body.text}</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <WhatsAppButton
                    text={stillHaveQuestions.whatsappPrompt.text}
                    label={stillHaveQuestions.whatsappLabel}
                    variant="outline-light"
                  />
                  <CallLink label={stillHaveQuestions.callLabel} />
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
          <Accordion
            headingLevel={3}
            items={items.map((item) => ({
              id: faqItemId(item.id),
              question: item.q,
              answer: <FaqAnswer answer={item.a} />,
            }))}
          />
        </div>
      </div>
    </Section>
  );
}
