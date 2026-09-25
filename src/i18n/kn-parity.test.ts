/**
 * The guard that says a Kannada page is actually in Kannada.
 *
 * `Translation<T>` already makes a missing key a compile error, which is the strong half. This is
 * the half a type cannot do: it walks the MERGED content — what `getContent("kn")` actually hands
 * to the page — and checks that every string a reader can see changed. A type cannot tell the
 * difference between a translated string and the English one pasted back in.
 *
 * It fails, deliberately, on three separate things:
 * - a string the English side has and Kannada does not (the merge would silently keep English);
 * - a Kannada string that is still the English string, unless it is on the allowlist below;
 * - a template whose `{placeholders}` no longer match the English ones, which would print
 *   "{phone}" to a reader or drop the number entirely.
 */

import { describe, expect, it } from "vitest";
import { getContent, type Content } from "./content";
import { placeholdersIn, slotsIn } from "./format";
import { FIXED_KEYS } from "./translation";

/**
 * Strings that are the same in both locales, and why.
 *
 * Three kinds, and nothing else belongs here:
 * - proper names and units, which WCAG 2.2 SC 3.1.2 exempts and which a reader recognises
 *   precisely because they are not translated (brand names, kWp, kWh, GSTIN);
 * - a reviewer's decision that the English wording is the Kannada wording ("Energy Made
 *   Intelligent" is the brand line, kept Latin per the brand PDF);
 * - strings nothing renders, which the generator's own UNTRANSLATED list also names.
 *
 * Every entry is a full path, so it cannot cover more than it says.
 */
const SAME_IN_BOTH: Readonly<Record<string, string>> = {
  "site.tagline": "brand line, kept Latin (brand PDF p.5); the reviewers' row repeats it verbatim",
  "ui.calculator.kwpUnit": "unit symbol",
  "ui.calculator.kwhUnit": "unit symbol",
  "ui.calculator.flags.kwh-clamped": "the kWh input is not offered, so this flag cannot be raised here",
  "home.audiencePaths.items[0].tile": "legacy home-hero tile; no component renders `tile`",
  "home.audiencePaths.items[1].tile": "legacy home-hero tile; no component renders `tile`",
  "home.audiencePaths.items[2].tile": "legacy home-hero tile; no component renders `tile`",
  "home.about.caption": "prototype caption; the rebuilt about band does not render it",
  "home.calculator.fields.tariff.label": "input withdrawn at owner review round 2",
  "home.calculator.fields.tariff.hint": "input withdrawn at owner review round 2",
  "images.duskSkyline.alt": 'hero slide 1: decoration behind fixed copy, rendered with alt=""',
  "socialPending[0].label": "the network's own name",
  "ui.meta.socialImageAlt":
    "both holes are Latin \u2014 the brand name and the brand line \u2014 so the reviewers' row (u248) repeats the English",
  "ui.footer.gstin": "the statutory identifier: label and number both stay Latin, to match the certificate (glossary #77)",
  "quote.summary.kwp": "a figure and a unit symbol, nothing to translate; the reviewers' row (u136) repeats it",
  "quote.assumptions.tariffEntered.value":
    "the average-tariff input was withdrawn at owner review round 2, so the engine cannot take this branch",
  "quote.citations.enteredTariff":
    "the average-tariff input was withdrawn at owner review round 2, so the engine cannot take this branch",
  "contactPage.ways.whatsapp.eyebrow": "the network's own name",
  "ui.quickQuote.emailPlaceholder": "an example address; email addresses are written in Latin letters in any language",
  "about.brand.tagline.text": "the brand line, kept Latin (brand PDF p.5); the reviewers' row repeats it verbatim",
  "about.brand.purposeShort.text": "brand PDF purpose line; the rebuilt About page renders positioning and promise only",
  "about.brand.introduction.text": "brand PDF 10-word introduction; nothing on the site renders it",
  // <SegmentFaq> flattens the groups into one list and never prints a group heading.
  "segments.home.faq.groups[0].label": "FAQ group headings are not rendered",
  "segments.home.faq.groups[1].label": "FAQ group headings are not rendered",
  "segments.home.faq.groups[2].label": "FAQ group headings are not rendered",
  "segments.home.faq.groups[3].label": "FAQ group headings are not rendered",
  "segments.housing-society.faq.groups[0].label": "FAQ group headings are not rendered",
  "segments.housing-society.faq.groups[1].label": "FAQ group headings are not rendered",
  "segments.commercial.faq.groups[0].label": "FAQ group headings are not rendered",
  "segments.commercial.faq.groups[1].label": "FAQ group headings are not rendered",
  "solutionsShared.systemTypes.items[0].description": "audience-neutral one-liner; the cards render `plainDescription` or nothing",
  "solutionsShared.systemTypes.items[1].description": "audience-neutral one-liner; the cards render `plainDescription` or nothing",
  "solutionsShared.systemTypes.items[2].description": "audience-neutral one-liner; the cards render `plainDescription` or nothing",
};

/**
 * Keys the overlay type never carries, so both locales share them by construction.
 *
 * Read from `FIXED_KEYS` rather than retyped, plus the per-module additions declared in
 * scripts/build-kn-content.ts. If the type's list grows, this walk follows it.
 */
const FACT_KEYS = new Set<string>([
  ...FIXED_KEYS,
  "contact",
  "legal",
  "social",
  "legacyName",
  // The three sections of an audience page that no component renders (see the segments entry in
  // scripts/build-kn-content.ts). They are English-owned there, so there is nothing to compare.
  "whoItsFor",
  "included",
  "leadForm",
]);

interface Leaf {
  path: string;
  en: string;
  kn: string;
}

/** Every string both locales carry, paired, in the shape a page reads them. */
function leaves(en: unknown, kn: unknown, path = ""): Leaf[] {
  if (typeof en === "string") return [{ path, en, kn: typeof kn === "string" ? kn : en }];
  if (en === null || typeof en !== "object") return [];
  if (Array.isArray(en)) {
    const other = Array.isArray(kn) ? kn : [];
    return en.flatMap((item, i) => leaves(item, other[i], `${path}[${i}]`));
  }
  const source = en as Record<string, unknown>;
  const target = (kn ?? {}) as Record<string, unknown>;
  return Object.entries(source).flatMap(([key, value]) =>
    FACT_KEYS.has(key) ? [] : leaves(value, target[key], path ? `${path}.${key}` : key),
  );
}

/** `held` never renders, so it is not translated and must not be measured. */
function comparable(content: Content) {
  const { held, ...home } = content.home;
  const { held: aboutHeld, ...about } = content.about;
  // Each segment carries its own `held`; strip all three the same way.
  const segments = Object.fromEntries(
    Object.entries(content.segments).map(([slug, { held: segmentHeld, ...rest }]) => {
      void segmentHeld;
      return [slug, rest];
    }),
  );
  void held;
  void aboutHeld;
  return {
    site: content.site,
    nav: content.nav,
    primaryCta: content.primaryCta,
    socialPending: content.socialPending,
    home,
    faq: content.faq,
    images: content.images,
    faqCardLabels: content.faqCardLabels,
    quote: content.quote,
    about,
    // `contactPage`, not `contact`: "contact" is a FACT key (site.ts business facts), and the
    // walk skips fact keys by name at any depth — so calling it that would have quietly skipped
    // the whole /contact page.
    contactPage: content.contact,
    segments,
    solutionsShared: content.solutionsShared,
    ui: content.ui,
  };
}

const english = comparable(getContent("en"));
const kannada = comparable(getContent("kn"));
const pairs = leaves(english, kannada);

describe("the Kannada overlay covers the English copy", () => {
  it("finds a string to compare", () => {
    // A guard on the guard: if the walk broke, everything below would pass by finding nothing.
    expect(pairs.length).toBeGreaterThan(200);
  });

  it("leaves no English string on a Kannada page", () => {
    const untranslated = pairs.filter((leaf) => leaf.kn === leaf.en && !(leaf.path in SAME_IN_BOTH));
    expect(
      untranslated.map((leaf) => `${leaf.path}: ${JSON.stringify(leaf.en)}`),
      "run `npm run build:kn`; if the string is a name, a unit or unrendered, add it to SAME_IN_BOTH with a reason",
    ).toEqual([]);
  });

  it("keeps the allowlist honest", () => {
    // An entry that no longer matches anything is a note about a string that has moved on.
    const paths = new Set(pairs.map((leaf) => leaf.path));
    expect(Object.keys(SAME_IN_BOTH).filter((path) => !paths.has(path))).toEqual([]);
    const stillEqual = Object.keys(SAME_IN_BOTH).filter(
      (path) => pairs.find((leaf) => leaf.path === path)?.kn !== pairs.find((leaf) => leaf.path === path)?.en,
    );
    expect(stillEqual, "these now differ between locales; drop them from SAME_IN_BOTH").toEqual([]);
  });

  it("keeps the same placeholders on both sides of a template", () => {
    const drifted = pairs
      .filter((leaf) => placeholdersIn(leaf.en).join() !== placeholdersIn(leaf.kn).join())
      .map((leaf) => `${leaf.path}: {${placeholdersIn(leaf.en)}} vs {${placeholdersIn(leaf.kn)}}`);
    expect(drifted).toEqual([]);
  });

  it("keeps the same markup slots on both sides of a rich sentence", () => {
    // The consent copy carries its links and its opening emphasis as named slots rather than as
    // JSX children, so the translator can move them inside the sentence. A dropped
    // <privacyLink> would take a link a DPDP notice has to offer with it, and nothing on screen
    // would say so; an invented tag throws in <RichText>.
    const drifted = pairs
      .filter((leaf) => slotsIn(leaf.en).join() !== slotsIn(leaf.kn).join())
      .map((leaf) => `${leaf.path}: <${slotsIn(leaf.en)}> vs <${slotsIn(leaf.kn)}>`);
    expect(drifted).toEqual([]);
  });
});

describe("the overlay cannot move a fact", () => {
  it("keeps hrefs, ids and statuses English-owned", () => {
    const en = getContent("en");
    const kn = getContent("kn");
    expect(kn.home.about.cta.href).toBe(en.home.about.cta.href);
    expect(kn.home.about.copy.status).toBe(en.home.about.copy.status);
    expect(kn.home.about.copy.source).toBe(en.home.about.copy.source);
    expect(kn.faq.items.map((f) => f.id)).toEqual(en.faq.items.map((f) => f.id));
    expect(kn.images.terraceArray.src).toBe(en.images.terraceArray.src);
    expect(kn.site.contact.phonePrimary.value.tel).toBe(en.site.contact.phonePrimary.value.tel);
  });

  it("keeps a proposed claim proposed", () => {
    const proposed = getContent("kn").home.projects.copy;
    expect(proposed.status).toBe("proposed");
  });
});

describe("accents", () => {
  it("names a run that is actually part of its own heading", () => {
    for (const locale of ["en", "kn"] as const) {
      const { home, about, contact, solutionsShared } = getContent(locale);
      const headings = [
        home.audiencePaths.copy,
        home.about.copy,
        home.system.copy,
        home.why.copy,
        home.brands.copy,
        home.projects.copy,
        home.calculator.copy,
        home.finalCta.copy,
        about.mission,
        about.story.copy,
        about.values.copy,
        about.closingCta.copy,
        contact.hero,
        contact.callBack,
        solutionsShared.closingCta,
      ];
      for (const copy of headings) {
        expect(copy.accent, `${locale}: ${copy.title}`).not.toBe("");
        expect(copy.title, `${locale}: accent not found in title`).toContain(copy.accent);
      }
    }
  });
});
