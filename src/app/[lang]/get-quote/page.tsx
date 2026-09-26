import { Link } from "@/components/i18n/LocaleLink";
import { connection } from "next/server";
import { parseSegment } from "@/components/quote/copy";
import { EstimateControls } from "@/components/quote/EstimateControls";
import { EstimateProvider } from "@/components/quote/EstimateProvider";
import { EstimateResults } from "@/components/quote/EstimateResults";
import { fillTags } from "@/components/quote/template";
import { LeadForm } from "@/components/quote/LeadForm";
import { mailConfigured } from "@/lib/env.server";
import { Reveal } from "@/components/motion/Reveal";
import { MobileSummaryBar } from "@/components/quote/MobileSummaryBar";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Accent, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { getContent } from "@/i18n/content";
import { site, whatsappLink } from "@/content/site";
import { langParams } from "@/i18n/registry";
import { requirePublishedLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("get-quote");

export async function generateMetadata() {
  const locale = await requirePublishedLocale("get-quote");
  const { meta } = getContent(locale).quote;
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path: "/get-quote",
    locale,
  });
}

const linkClass = "font-medium text-green-700 underline underline-offset-2 hover:no-underline";

/**
 * The moment this page was served. `connection()` makes the wait for the request explicit, so
 * the timestamp can never be baked in at build time; the lead action measures against it to
 * catch bots that post instantly (src/lib/leads/schema.ts, MIN_FILL_TIME_MS).
 */
async function servedAt(): Promise<number> {
  await connection();
  return Date.now();
}

/**
 * The calculator page.
 *
 * Everything below the Section wrappers is a client island, and an island may not import copy
 * (scripts/check-client-content.ts) — so this component does the one read of `getContent` and
 * hands each island the slice it prints. That is also what keeps a Kannada string out of an
 * English page's payload: only one locale's `quote` object is ever serialised.
 */
export default async function GetQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // Only the segment is read. Legacy redirects forward the old query string, which could carry
  // a name or a phone number; none of it is read, echoed or stored.
  const initialSegment = parseSegment(params.segment);

  // Server-rendered rather than set on mount: it then works with JavaScript off too, and is
  // immune to a wrong clock on the visitor's device (the action compares against server time).
  const startedAt = await servedAt();

  const locale = await requirePublishedLocale("get-quote");
  const content = getContent(locale);
  const quote = content.quote;
  const calculator = content.ui.calculator;

  const phone = site.contact.phonePrimary.value;
  const phoneAlt = site.contact.phoneSecondary.value;
  const email = site.contact.email.value;

  return (
    <EstimateProvider initialSegment={initialSegment} pincodeError={quote.controls.pincodeError}>
      <BreadcrumbJsonLd items={[{ name: quote.breadcrumb.current, path: "/get-quote" }]} />

      <Section surface="canvas" containerClassName="emerge grid-page items-start gap-y-12">
        <nav aria-label={quote.breadcrumb.navLabel} className="col-span-4 md:col-span-8 lg:col-span-12">
          <ol className="flex flex-wrap items-center gap-2 text-small text-grey-600">
            <li>
              <Link href="/" className={linkClass}>
                {quote.breadcrumb.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">{quote.breadcrumb.current}</li>
          </ol>
        </nav>

        {/*
          Not sticky, deliberately. This panel is the tallest thing in its row — 735px empty and
          about 890px once the estimate fills in its last two tiles, against a 620px form column
          — so it has no room to travel and sticking it does nothing. Nor is it worth shrinking
          to fit a laptop fold: the figures are the reason the page exists, and the panel changes
          height when they arrive, so no fixed layout holds both states above the fold.
        */}
        <div
          data-surface="dark"
          className="@container col-span-4 rounded-lg bg-teal-900 p-6 sm:p-8 md:col-span-8 lg:col-span-5"
        >
          {/* Owner-approved prototype copy (D-009): calc.eyebrow and calc.title, verbatim. */}
          <Eyebrow tone="signal">{quote.hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 font-display text-h2 font-extrabold text-white">{quote.hero.title}</h1>
          {/*
            PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Shortened: the instruction it used to
            carry ("tell us what you are putting solar on and roughly what you spend") is the
            same thing the Step 1 column says beside it, and saying it twice cost the panel two
            lines that pushed its last tiles below the fold on a laptop.
          */}
          <p className="mt-4 text-lead text-white/80">{quote.hero.lead}</p>
          <EstimateResults
            copy={{
              results: quote.results,
              assumptions: quote.assumptions,
              citations: quote.citations,
              flags: calculator.flags,
              units: { kwp: calculator.kwpUnit, kwh: calculator.kwhUnit, years: calculator.yearsUnit },
            }}
          />
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <Eyebrow>{quote.step1.eyebrow}</Eyebrow>
          <h2 className="mt-4 font-display text-h3 font-bold text-carbon">{quote.step1.heading}</h2>
          <div className="mt-8">
            <EstimateControls
              copy={{
                controls: quote.controls,
                segmentLabels: calculator.segments,
                segments: quote.segments,
                optionalMarker: content.ui.fields.optionalMarker,
                format: quote.format,
              }}
            />
          </div>
        </div>
      </Section>

      <Section
        surface="white"
        id="lead-form"
        aria-labelledby="lead-form-heading"
        containerClassName="grid-page items-start gap-y-12"
      >
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-7">
          <SectionHeading
            id="lead-form-heading"
            eyebrow={quote.step2.eyebrow}
            align="stacked"
            // `<accent>` marks the green run inside the sentence, so the reviewer can move it:
            // in Kannada the emphasised noun is not the last word.
            title={<>{fillTags(quote.step2.title, { tags: { accent: (children) => <Accent>{children}</Accent> } })}</>}
            lead={quote.step2.lead}
          />
          <div className="mt-10">
            <LeadForm
              startedAt={startedAt}
              canSend={mailConfigured}
              contact={{ phone: site.contact.phonePrimary.value, whatsappHref: whatsappLink() }}
              copy={quote.form}
              optionalMarker={content.ui.fields.optionalMarker}
              locale={locale}
            />
          </div>
        </Reveal>

        <Reveal as="aside" delay={0.08} className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
          <Card padding="lg">
            <h2 className="font-display text-h4 font-semibold text-carbon">{quote.aside.heading}</h2>
            <ul className="mt-4 grid gap-3 text-body text-ink-2">
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {quote.aside.whatsapp}
                </a>
              </li>
              <li>
                <a href={`tel:${phone.tel}`} className={`${linkClass} tabular-nums`}>
                  {phone.display}
                </a>
              </li>
              <li>
                <a href={`tel:${phoneAlt.tel}`} className={`${linkClass} tabular-nums`}>
                  {phoneAlt.display}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className={linkClass}>
                  {email}
                </a>
              </li>
            </ul>
          </Card>
        </Reveal>
      </Section>

      <MobileSummaryBar targetId="lead-form" copy={{ summary: quote.summary, format: quote.format }} />
    </EstimateProvider>
  );
}
