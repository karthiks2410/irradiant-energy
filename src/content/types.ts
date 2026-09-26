/**
 * Content contracts for `src/content/*`.
 *
 * Every renderable item carries a `source` and a `status`, so a page can show where a
 * line came from in preview and nothing unverified reaches production (decisions.md
 * D-004, D-009). Facts that are not cleared live in each module's `held` export with a
 * reason; page builders never render `held`.
 *
 * Source notation: inventory row ids from docs/content-inventory.md ("H-4", "P-SH-2",
 * "CL-05", "N-44"), discovery notes ("03 §4.4"), "prototype <key>" for the owner's HTML
 * prototype dictionary, "brand PDF p.N", or "site.ts".
 */

export type ClaimStatus =
  /** Observed on the legacy live site and in its repo `main`; the wording may carry over. */
  | "verified-live"
  /** Brand Identity Guidelines PDF (design and voice authority, D-004). */
  | "brand-pdf"
  /** Positioning copy from the owner's HTML prototype, or wording fixed by an owner decision (D-009). */
  | "owner-approved-template"
  /** Needs owner evidence or approval. Lives only in a `held` export. */
  | "held"
  /**
   * New positioning/UX copy written for this build, never a factual claim.
   * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL.
   */
  | "proposed";

export type RenderableStatus = Exclude<ClaimStatus, "held">;

export interface Sourced {
  source: string;
  status: RenderableStatus;
}

export interface TextItem extends Sourced {
  text: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface Cta extends Sourced {
  label: string;
  href: string;
}

/**
 * Copy for a section head. `status` and `source` describe the title and lead; the
 * eyebrow is a short UX label (font-mono, uppercase, leading rule).
 */
export interface SectionCopy extends Sourced {
  eyebrow?: string;
  /** Sentence case (report §6). */
  title: string;
  lead?: string;
  /**
   * The run of `title` that renders in the accent green, written out rather than derived.
   *
   * The two-tone headline used to take the last N words, which only works in a language whose
   * emphasised phrase lands last. Kannada puts the verb there, so a positional rule paints the
   * verb green and leaves the noun phrase in ink, and because Kannada compounds, two words can
   * be the whole line (docs/kannada/research/layout-risks.md M9). Each locale therefore names
   * its own run: English repeats what the positional rule produced (accent-split.test.ts
   * proves it, character for character), and the Kannada overlay carries the reviewer's
   * `accentPhrase`.
   *
   * Optional because not every heading is two-tone. Where it is set, the Kannada overlay must
   * set it too — `Translation<T>` sees the key on the `as const` literal and requires it.
   */
  accent?: string;
}

export interface HeroCopy extends SectionCopy {
  eyebrow: string;
  lead: string;
  /** Short proof chips under the lead: positioning only, no numbers or credentials. */
  chips?: readonly string[];
  cta: Cta;
  secondaryCta?: Cta;
}

export interface Step extends Sourced {
  number: string;
  title: string;
  description: string;
}

/** Icon names the ui-kit maps to its icon set; taken from the prototype's card keys. */
export type IconKey =
  | "sun"
  | "battery"
  | "charge"
  | "monitor"
  | "site"
  | "doc"
  | "shield"
  | "tools"
  | "dash"
  | "support";

export interface Feature extends Sourced {
  title: string;
  description: string;
  number?: string;
  icon?: IconKey;
  /** D-009: offerings not sold yet render with a "Coming next" label and no CTA. */
  comingNext?: boolean;
}

export interface Faq extends Sourced {
  /** Inventory FAQ id (H-4, S-2, C-6); stable across pages. */
  id: string;
  q: string;
  /** Paragraphs are separated by "\n\n"; lines starting with "• " or "1. " are list items. */
  a: string;
}

export interface FaqGroup {
  id: string;
  label: string;
  items: readonly Faq[];
}

export interface FaqSection {
  copy: SectionCopy;
  groups: readonly FaqGroup[];
  stillHaveQuestions: {
    title: string;
    body: TextItem;
    whatsappPrompt: TextItem;
    whatsappLabel: string;
    callLabel: string;
  };
}

export type SystemTypeId = "on-grid" | "off-grid" | "hybrid";

export interface SystemType extends Sourced {
  id: SystemTypeId;
  /**
   * The mono label above the card headline ("On-Grid").
   *
   * `label`, not `name`: `name` is English-owned at every depth of a Kannada overlay
   * (FIXED_KEYS in src/i18n/translation.ts) because it holds proper names — the brand, a team
   * member. These three are translated technical labels, and the home page's system tags already
   * carry the same words in Kannada.
   */
  label: string;
  /** Card headline. */
  plainName: string;
  /** Audience-neutral one-liner: use it on the housing-society and business pages. */
  description: string;
  /** Written for homeowners (inventory P-SG-3): use it on the Homes page only. */
  plainDescription: string;
  note?: string;
}

export type SegmentSlug = "home" | "housing-society" | "commercial";

export interface AudiencePath extends Sourced {
  slug: SegmentSlug;
  label: string;
  /** The legacy home-hero tile line, e.g. "Rooftop for your house". */
  tile: string;
  description: string;
  href: string;
}

export interface BillRange {
  value: string;
  label: string;
}

export interface LeadFormCopy extends Sourced {
  eyebrow: string;
  title: string;
  lead: string;
  submitLabel: string;
  billLabel: string;
  billRanges: readonly BillRange[];
  organisationField?: {
    label: string;
    placeholder: string;
    /** Field name forwarded with the lead. */
    name: string;
  };
}

export interface TeamMember extends Sourced {
  name: string;
  role: string;
}

/** A verified, consented case study. Nothing renders until the owner supplies one (D-009). */
export interface Project extends Sourced {
  title: string;
  segment: SegmentSlug;
  location?: string;
  capacityKwp?: number;
  commissioned?: string;
}

export interface HeldItem {
  /** Stable id, e.g. "H-1" or "home:journey:pills". */
  id: string;
  /** Where it would have rendered. */
  where: string;
  /** The withheld wording, verbatim, or the conflicting value that was not used. */
  text: string;
  reason: string;
  /** Inventory row ids or note references. */
  ref: string;
}

export interface Segment {
  slug: SegmentSlug;
  href: string;
  /** Nav label and menu description come from site.ts so they cannot drift. */
  label: string;
  description: string;
  meta: Sourced & { title: string; description: string };
  hero: HeroCopy;
  whoItsFor: { copy: SectionCopy; items: readonly TextItem[] };
  journey: { copy: SectionCopy; steps: readonly Step[] };
  included: { copy: SectionCopy; items: readonly TextItem[] };
  trust: { copy: SectionCopy; cards: readonly Feature[] };
  faq: FaqSection;
  leadForm: LeadFormCopy;
  held: readonly HeldItem[];
}

export type LegalPageStatus = "draft-for-counsel" | "approved";

interface LegalPageBase {
  slug: "privacy" | "terms" | "cookies";
  href: string;
  /** Why the page exists (regime or hygiene), for counsel. */
  basis: string;
  /** Section outline counsel drafts against. Not copy. */
  outline: readonly string[];
}

/**
 * A notice is either a counsel draft or an approved version. Every notice's own body tells the
 * reader that "the version and the date it takes effect appear at the top of this page", so an
 * approved notice cannot exist without both: the union makes that a compile error rather than a
 * promise the page does not keep.
 */
export type LegalPage = LegalPageBase &
  (
    | { status: "draft-for-counsel"; version?: never; effectiveFrom?: never }
    | {
        status: "approved";
        /** Published version label, e.g. "1.0". */
        version: string;
        /** ISO date the version takes effect. */
        effectiveFrom: string;
      }
  );

/**
 * A paragraph or a list item that follows whether this build can load Google Analytics
 * (`analyticsEnabled`, src/lib/analytics.ts): `withAnalytics` in a build with a measurement ID,
 * `withoutAnalytics` in one without. With no `withoutAnalytics`, nothing renders in its place, so a
 * notice never names a processor the deployment does not use. Both forms are whole sentences, and
 * both are translated.
 */
export interface AnalyticsVariant {
  readonly withAnalytics: string;
  readonly withoutAnalytics?: string;
}

/**
 * One block of a legal notice's body, as <LegalBody> (src/components/pages/LegalBody.tsx)
 * renders it.
 *
 * Every string is a whole sentence (or a whole list item) with its links and emphasis as named
 * `<slot>…</slot>` tags and its facts as `{holes}` — never English fragments welded around a
 * value, because Kannada puts the value and the link somewhere else in the sentence. The facts
 * themselves (`{siteName}`, `{entityName}`, `{email}`, `{phone}`, the cookie's name and
 * lifetime) are filled in at render time from site.ts and lib/consent.ts, so a translation can
 * never change one.
 *
 * `pending` is the note on the yellow placeholder tag that marks an unconfirmed fact. The tag
 * renders only outside production (PlaceholderTag), so the note is English-owned scaffolding: it
 * is left out of the Kannada overlay by the generator (MODULES in scripts/build-kn-content.ts).
 */
export type LegalBlock =
  /** A paragraph. */
  | string
  /** A bulleted list, one sentence fragment per item; an item can follow the analytics build. */
  | { readonly items: readonly (string | AnalyticsVariant)[] }
  /** A paragraph that follows the analytics build (see AnalyticsVariant). */
  | AnalyticsVariant
  /** A paragraph set in bold from end to end. */
  | { readonly emphasis: string }
  /** A paragraph opened by a placeholder tag, for a line that rests on something still unconfirmed. */
  | { readonly text: string; readonly pending: string }
  /** The postal address, then these lines, one per line (`<br />` between them). */
  | { readonly contactLines: readonly string[] }
  /**
   * The operator line, in the form that matches site.legal.entityName: `withEntity` while the
   * registered entity is known, `withoutEntity` (opened by the placeholder tag) while it is not.
   */
  | { readonly withEntity: string; readonly withoutEntity: string; readonly pending: string }
  /**
   * The grievance officer's name and email address from site.legal.grievanceOfficer — facts, no
   * copy — or, while nobody is named, this fallback opened by the placeholder tag.
   */
  | { readonly grievanceFallback: string; readonly pending: string };

export interface LegalSection {
  /** Anchor on the heading, for a section something else links to (`/cookies#cookie-settings`). */
  readonly id?: string;
  readonly heading: string;
  readonly body: readonly LegalBlock[];
}

/** One notice: its title (H1, breadcrumb, JSON-LD name and <title>), meta description and body. */
export interface LegalNotice {
  readonly title: string;
  readonly description: string;
  /** One-sentence summary under the title. Plain language, no legal effect. */
  readonly summary: string;
  readonly sections: readonly LegalSection[];
}
