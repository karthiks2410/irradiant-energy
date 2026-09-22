import { Link } from "@/components/i18n/LocaleLink";
import { connection } from "next/server";
import { parseSegment } from "@/components/quote/copy";
import { EstimateControls } from "@/components/quote/EstimateControls";
import { EstimateProvider } from "@/components/quote/EstimateProvider";
import { EstimateResults } from "@/components/quote/EstimateResults";
import { LeadForm } from "@/components/quote/LeadForm";
import { mailConfigured } from "@/lib/env.server";
import { MobileSummaryBar } from "@/components/quote/MobileSummaryBar";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Accent, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { site, whatsappLink } from "@/content/site";
import { langParams } from "@/i18n/registry";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const generateStaticParams = () => langParams("get-quote");

export async function generateMetadata() {
  return pageMetadata({
    title: "Solar estimate calculator",
    description:
      "Size a rooftop solar system for your home, housing society or business, see the estimated cost, savings and payback, then ask us for a proposal.",
    path: "/get-quote",
    locale: await getLocale(),
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

  const phone = site.contact.phonePrimary.value;
  const phoneAlt = site.contact.phoneSecondary.value;
  const email = site.contact.email.value;

  return (
    <EstimateProvider initialSegment={initialSegment}>
      <BreadcrumbJsonLd items={[{ name: "Calculator", path: "/get-quote" }]} />

      <Section surface="canvas" containerClassName="grid-page items-start gap-y-12">
        <nav aria-label="Breadcrumb" className="col-span-4 md:col-span-8 lg:col-span-12">
          <ol className="flex flex-wrap items-center gap-2 text-small text-grey-600">
            <li>
              <Link href="/" className={linkClass}>
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Calculator</li>
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
          className="col-span-4 rounded-lg bg-teal-900 p-6 sm:p-8 md:col-span-8 lg:col-span-5"
        >
          {/* Owner-approved prototype copy (D-009): calc.eyebrow and calc.title, verbatim. */}
          <Eyebrow tone="signal">Solar calculator</Eyebrow>
          <h1 className="mt-4 font-display text-h2 font-extrabold text-white">
            Estimate the right solar system for your site.
          </h1>
          {/*
            PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Shortened: the instruction it used to
            carry ("tell us what you are putting solar on and roughly what you spend") is the
            same thing the Step 1 column says beside it, and saying it twice cost the panel two
            lines that pushed its last tiles below the fold on a laptop.
          */}
          <p className="mt-4 text-lead text-white/80">The figures update as you go.</p>
          <EstimateResults />
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <Eyebrow>Step 1</Eyebrow>
          <h2 className="mt-4 font-display text-h3 font-bold text-carbon">Your property and usage</h2>
          <div className="mt-8">
            <EstimateControls />
          </div>
        </div>
      </Section>

      <Section
        surface="white"
        id="lead-form"
        aria-labelledby="lead-form-heading"
        containerClassName="grid-page items-start gap-y-12"
      >
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <SectionHeading
            id="lead-form-heading"
            eyebrow="Step 2"
            align="stacked"
            title={
              <>
                Get your <Accent>proposal</Accent>.
              </>
            }
            lead="Your estimate is sent with your details."
          />
          <div className="mt-10">
            <LeadForm startedAt={startedAt} canSend={mailConfigured} />
          </div>
        </div>

        <aside className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
          <Card padding="lg">
            <h2 className="font-display text-h4 font-semibold text-carbon">Prefer to talk?</h2>
            <ul className="mt-4 grid gap-3 text-body text-ink-2">
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  WhatsApp us
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
        </aside>
      </Section>

      <MobileSummaryBar targetId="lead-form" />
    </EstimateProvider>
  );
}
