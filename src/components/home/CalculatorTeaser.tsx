import { ButtonLink, Card, CheckIcon, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/motion/Reveal";
import { homePage } from "@/content/home";
import { AccentTitle } from "./AccentTitle";

const { calculator } = homePage;

/**
 * Calculator teaser on Deep Teal. The prototype filled its preview panel with worked
 * figures; none of them are verified, and a calculator result is never a promise
 * (brand PDF p.31), so this panel shows only what the calculator asks for and what it
 * returns. The numbers themselves live behind the CTA, on /get-quote.
 */
export function CalculatorTeaser() {
  return (
    <Section surface="dark" aria-labelledby="calculator-heading">
      <Reveal>
        <div className="grid-page gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <SectionHeading
              id="calculator-heading"
              align="stacked"
              eyebrow={calculator.copy.eyebrow}
              eyebrowTone="signal"
              title={<AccentTitle text={calculator.copy.title} />}
            />

            <ul className="mt-10 space-y-4">
              {calculator.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-body text-white/85">
                  <CheckIcon className="mt-1 size-4 shrink-0 text-yellow-400" />
                  {bullet}
                </li>
              ))}
            </ul>

            <ButtonLink href={calculator.cta.href} variant="light" className="mt-10">
              {calculator.cta.label}
            </ButtonLink>
          </div>

          <Card padding="lg" className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8">
            <Eyebrow as="p" rule={false}>
              What it asks for
            </Eyebrow>
            <ul className="mt-5 flex flex-wrap gap-2">
              {calculator.previewInputs.map((input) => (
                <li
                  key={input}
                  className="rounded-full border border-white/20 px-4 py-2 text-small text-white/85"
                >
                  {input}
                </li>
              ))}
            </ul>

            <Eyebrow as="p" rule={false} className="mt-10">
              What it gives back
            </Eyebrow>
            <ul className="mt-5 grid gap-x-(--grid-gutter) gap-y-4 sm:grid-cols-2">
              {calculator.previewResults.map((result) => (
                <li key={result} className="border-t border-white/20 pt-3">
                  <span className="font-mono text-label text-white uppercase">{result}</span>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-small text-on-dark-muted">{calculator.disclaimer}</p>
          </Card>
        </div>
      </Reveal>
    </Section>
  );
}
