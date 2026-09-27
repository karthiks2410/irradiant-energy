import { Link } from "@/components/i18n/LocaleLink";
import { Reveal } from "@/components/motion/Reveal";
import { quickQuoteCopy } from "@/components/quote/quick-quote-copy";
import { ArrowRightIcon, CheckIcon, SectionHeading } from "@/components/ui";
import type { Content } from "@/i18n/content";
import { AccentTitle } from "./AccentTitle";
import { HomeQuoteForm } from "./HomeQuoteForm";
import { QUOTE_SECTION_ID } from "./quote-section";

/**
 * The home page's quote band: the header popup's form, always open, where the calculator band was.
 *
 * Owner decision, 2026-09-27: the calculator band handed out the whole estimate before asking for
 * anything, so a visitor who never pressed the popup button left without a trace. The popup stays
 * exactly as it is, and the same form now sits here too — "same system, two places they can't
 * miss". It is one implementation (<QuickQuoteInline>, components/quote/QuickQuote.tsx): the same
 * fields in the same order, the same checks, the same result and the same "Email me the full
 * breakdown" step. The full calculator, figures first and details only to email them, stays on
 * /get-quote, and the link here says so for anyone who wants it.
 *
 * Layout: the old band's shell — one white panel on the Deep Teal band, a dark pitch beside a white
 * working half (28px radius, 18px padding and gap, the prototype's soft shadow) — so the page keeps
 * its rhythm and the card language of the rest of it. On a phone the two halves stack, pitch first.
 *
 * It does not use <Section surface="dark"> for the reason the old band did not: that sets
 * data-surface="dark" on the whole section, and the ui-kit's `in-data-[surface=dark]` would paint
 * the form's labels white inside the white card. Only the pitch declares the dark surface.
 *
 * Words: the heading and eyebrow are the old band's (owner-approved prototype copy), the one
 * reassurance line is the audience pages' closing lead ("Free site visit. Free quote. Zero
 * pressure.", verified-live, "Free" owner-confirmed 2026-09-21), and the form is the popup's.
 * Only the link to the calculator is new (PROPOSED CONTENT — REQUIRES CLIENT APPROVAL).
 */
export function HomeQuote({ content }: { content: Content }) {
  const { calculator } = content.home;

  return (
    <section id={QUOTE_SECTION_ID} aria-labelledby="calculator-heading" className="section-y bg-teal-900">
      <div className="container-page">
        <Reveal>
          <div className="rounded-lg bg-white p-2.5 shadow-overlay md:p-[18px]">
            <div className="grid gap-2.5 md:gap-[18px] lg:grid-cols-[0.8fr_1.2fr]">
              <div
                data-surface="dark"
                className="relative isolate flex flex-col justify-between gap-8 overflow-hidden rounded-[24px] bg-teal-900 p-[22px] text-white md:p-8 lg:p-[34px]"
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

                <div className="grid gap-5">
                  <p className="flex items-start gap-2.5 text-ui text-white/85">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-yellow-400 text-teal-900"
                    >
                      <CheckIcon className="size-3.5" />
                    </span>
                    {content.solutionsShared.closingCta.lead}
                  </p>

                  <Link
                    href={calculator.detailedLink.href}
                    className="group inline-flex min-h-11 items-center gap-2 self-start text-ui font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors duration-200 hover:decoration-white"
                  >
                    {calculator.detailedLink.label}
                    <ArrowRightIcon className="size-4 shrink-0 transition-transform duration-200 ease-controlled group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              <HomeQuoteForm copy={quickQuoteCopy(content)} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
