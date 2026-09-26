import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink, CheckIcon, SectionHeading } from "@/components/ui";
import type { Content } from "@/i18n/content";
import { AccentTitle } from "./AccentTitle";
import { HomeCalculatorPanel } from "./HomeCalculatorPanel";

/**
 * The calculator band, rebuilt from the prototype's `.calc-shell`: one white panel floating on the
 * Deep Teal band, split .8fr / 1.2fr into a dark pitch and a working estimate form (28px radius,
 * 18px padding and gap, the prototype's soft shadow).
 *
 * It does not use <Section surface="dark">. That sets data-surface="dark" on the whole section, and
 * the ui-kit reads it through `in-data-[surface=dark]` on every descendant — which would paint the
 * form's labels white inside the white card. The band therefore carries the teal background itself
 * and only the pitch panel declares the dark surface.
 *
 * Server Component: only <HomeCalculatorPanel> hydrates, and the copy reaches it as props so the
 * content module stays out of the client bundle.
 */
export function HomeCalculator({ content }: { content: Content }) {
  const { calculator } = content.home;

  return (
    <section id="calculator" aria-labelledby="calculator-heading" className="section-y bg-teal-900">
      <div className="container-page">
        <Reveal>
          <div className="rounded-lg bg-white p-2.5 shadow-overlay md:p-[18px]">
            <div className="grid gap-2.5 md:gap-[18px] lg:grid-cols-[0.8fr_1.2fr]">
              <div
                data-surface="dark"
                className="relative isolate overflow-hidden rounded-[24px] bg-teal-900 p-[22px] text-white md:p-8 lg:p-[34px]"
              >
                {/* The prototype's `.calc-info:after`: a thick green ring bleeding off the corner. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -bottom-[90px] -z-10 size-[260px] rounded-full border-[50px] border-green-500/15"
                />

                <SectionHeading
                  id="calculator-heading"
                  align="stacked"
                  eyebrow={calculator.copy.eyebrow}
                  eyebrowTone="signal"
                  title={<AccentTitle text={calculator.copy.title} accent={calculator.copy.accent} />}
                />

                <ul className="mt-7 grid gap-3.5">
                  {calculator.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2.5 text-small text-white/80">
                      <span
                        aria-hidden="true"
                        className="grid size-6 shrink-0 place-items-center rounded-full bg-yellow-400 text-teal-900"
                      >
                        <CheckIcon className="size-3.5" />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>

                <ButtonLink href={calculator.cta.href} variant="light" className="mt-8 min-h-[54px]">
                  {calculator.cta.label}
                </ButtonLink>
              </div>

              <HomeCalculatorPanel
                fields={calculator.fields}
                results={calculator.results}
                assumptionsLabel={calculator.assumptionsLabel}
                disclaimer={calculator.disclaimer}
                assumptions={{ assumptions: content.quote.assumptions, citations: content.quote.citations }}
                ui={content.ui.calculator}
                optionalMarker={content.ui.fields.optionalMarker}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
