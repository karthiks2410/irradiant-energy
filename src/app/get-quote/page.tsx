import Link from "next/link";
import { connection } from "next/server";
import { parseSegment } from "@/components/quote/copy";
import { EstimateControls } from "@/components/quote/EstimateControls";
import { EstimateProvider } from "@/components/quote/EstimateProvider";
import { EstimateResults } from "@/components/quote/EstimateResults";
import { LeadForm } from "@/components/quote/LeadForm";
import { MobileSummaryBar } from "@/components/quote/MobileSummaryBar";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Accent, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { site, whatsappLink } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Solar estimate calculator",
  description:
    "Size a rooftop solar system for your home, housing society or business, see the estimated cost, savings and payback, then ask us for a proposal.",
  path: "/get-quote",
});

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

        <div
          data-surface="dark"
          className="col-span-4 rounded-lg bg-teal-900 p-6 sm:p-8 md:col-span-8 lg:col-span-5"
        >
          {/* Owner-approved prototype copy (D-009): calc.eyebrow and calc.title, verbatim. */}
          <Eyebrow tone="signal">Irradiant solar calculator</Eyebrow>
          <h1 className="mt-4 font-display text-h2 font-extrabold text-white">
            Estimate the right solar system for your site.
          </h1>
          <p className="mt-4 text-lead text-white/80">
            Tell us what you are putting solar on and roughly what you spend on electricity. The figures update as
            you go.
          </p>
          <EstimateResults />
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <Eyebrow>Step 1</Eyebrow>
          <h2 className="mt-4 font-display text-h3 font-bold text-carbon">Your property and usage</h2>
          <p className="mt-2 text-body text-ink-2">
            The more you can tell us, the closer the estimate gets. Your bill and your PIN code are the only two we
            need — the PIN code decides which tariffs the figures use.
          </p>
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
            lead="Your estimate travels with your details, so we can pick up exactly where you left off."
          />
          <div className="mt-10">
            <LeadForm startedAt={startedAt} />
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
