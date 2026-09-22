import { LogoSymbol } from "@/components/brand/Logo";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink, Card, Section, SectionHeading } from "@/components/ui";
import { homePage } from "@/content/home";
import { AccentTitle } from "./AccentTitle";
import styles from "./AboutBand.module.css";

const { about } = homePage;

/** Prototype tag-a … tag-d, in the order the copy lists them. */
const tagPositions = [styles.tagA, styles.tagB, styles.tagC, styles.tagD];

/**
 * About band, rebuilt against the owner's HTML prototype (owner override 2026-09-20: where the
 * prototype and the brand PDF disagree on shape, depth, motion and type, the prototype wins).
 *
 * The brand card is the prototype's .about-brand-card — 30px corners, the three-stop teal
 * gradient, the bottom-left green glow, and two counter-rotating orbits carrying the supplied
 * logo-only symbol on a soft translucent tile. The whole decoration is aria-hidden and driven
 * by CSS alone (see AboutBand.module.css), so this stays a Server Component with no client JS
 * and the only animated property is transform. It is off under prefers-reduced-motion.
 *
 * The copy column is the prototype's label-over-value tiles: a small mono green label above a
 * bold value, on white cards. Every string comes from src/content/home.ts.
 *
 * Surface: the prototype runs this band on canvas, but the built page alternates
 * canvas → white → canvas around it, so it stays white and the tiles rely on their border plus
 * the prototype's faint lift for separation.
 */
export function AboutBand() {
  return (
    <Section surface="white" aria-labelledby="about-heading">
      <Reveal>
        <div className="grid-page items-center gap-y-12">
          <div
            className={`${styles.card} relative order-last col-span-4 flex min-h-[420px] flex-col items-center justify-center gap-6 overflow-hidden rounded-[30px] border border-white/8 p-6 text-white shadow-overlay md:col-span-8 lg:order-first lg:col-span-5 lg:min-h-[520px]`}
          >
            <span aria-hidden="true" className={styles.glow} />

            <div aria-hidden="true" className={styles.stage}>
              <span className={styles.ring} />
              <span className={styles.ringInner}>
                <span className={`${styles.node} ${styles.n1}`} />
                <span className={`${styles.node} ${styles.n2}`} />
                <span className={`${styles.node} ${styles.n3}`} />
                <span className={`${styles.node} ${styles.n4}`} />
              </span>
              <span className={styles.core}>
                <LogoSymbol decorative className={styles.logo} />
              </span>
            </div>

            {/* lg and up: the prototype's floating pills, placed around the orbit. */}
            <div aria-hidden="true" className={`${styles.tagField} hidden lg:block`}>
              {about.tags.map((tag, index) => (
                <span key={tag} className={`${styles.tag} ${tagPositions[index] ?? ""}`}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Below lg the pills would cross the symbol, so they drop to a plain centred row. */}
            <div aria-hidden="true" className="relative flex flex-wrap justify-center gap-2 lg:hidden">
              {about.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionHeading
              id="about-heading"
              align="stacked"
              eyebrow={about.copy.eyebrow}
              title={<AccentTitle text={about.copy.title} />}
              lead={about.copy.lead}
            />

            {/*
              The prototype's .point tiles: mono green label, bold value, 14px gutters, and the
              card's barely-there lift (0 4px 20px rgba(2,52,43,.03)) that the flat pass dropped.
              The value is a <p>, not the prototype's <h4>: an h4 under this h2 would skip a level.
            */}
            <ul className="mt-7 grid gap-3.5 md:grid-cols-2">
              {about.points.map((point) => (
                <Card key={point.label} as="li" padding="none" className="p-5 shadow-[0_4px_20px_rgba(2,52,43,0.03)]">
                  <p className="font-label text-label font-bold text-green-700">{point.label}</p>
                  <p className="mt-2.5 font-display text-h4 font-bold">{point.value}</p>
                </Card>
              ))}
            </ul>

            <ButtonLink href={about.cta.href} variant="outline" className="mt-8">
              {about.cta.label}
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
