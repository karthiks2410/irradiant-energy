/**
 * Proof that writing the accent out did not move the English headlines.
 *
 * The two-tone headline used to be derived from word position: `<AccentTitle>` coloured the last
 * N words, `<AccentedTitle>` the last one. That rule is an English assumption (layout-risks.md
 * M9), so the copy now names its own run. The risk in that change is silent: an accent that is
 * one word short still renders a perfectly plausible headline, and nobody would notice for weeks.
 *
 * So this re-runs the OLD rule, with the word counts the call sites used before the change, and
 * requires it to produce exactly what the explicit accent produces — the same three pieces, in
 * the same order, including the space that used to sit between the head and the <Accent> span.
 * That space is why English markup did not move: React writes a `<!-- -->` separator between two
 * adjacent text children, and keeping the head and the space as separate children keeps it.
 */

import { describe, expect, it } from "vitest";
import { splitOnAccent } from "./accent-split";
import { getContent } from "@/i18n/content";

/** The rule as it stood, verbatim: `parts.slice(0, -words)` then a space then the rest. */
function positional(text: string, words: number): { before: string; accent: string; after: string } {
  const parts = text.split(" ");
  if (parts.length <= words) return { before: "", accent: text, after: "" };
  return { before: `${parts.slice(0, -words).join(" ")} `, accent: parts.slice(-words).join(" "), after: "" };
}

/** Every English heading that used the positional rule, with the `words`/`tail` it passed. */
const HEADINGS: readonly { where: string; title: string; accent: string; words: number }[] = (() => {
  const { home } = getContent("en");
  return [
    { where: "home/audiencePaths", ...home.audiencePaths.copy, words: 2 },
    { where: "home/about", ...home.about.copy, words: 2 },
    { where: "home/system", ...home.system.copy, words: 4 },
    { where: "home/why", ...home.why.copy, words: 3 },
    { where: "home/brands", ...home.brands.copy, words: 2 },
    { where: "home/projects", ...home.projects.copy, words: 2 },
    { where: "home/calculator", ...home.calculator.copy, words: 2 },
    { where: "home/finalCta", ...home.finalCta.copy, words: 2 },
    // /solutions renders the same audiencePaths title through <AccentedTitle tail={1}>, whose
    // last word is "Karnataka." — a different split from the home page's "in Karnataka.".
  ].map(({ where, title, accent, words }) => ({ where, title, accent, words }));
})();

describe("splitOnAccent", () => {
  it("splits around an accent at the end, the English shape", () => {
    expect(splitOnAccent("Ready to see your savings?", "your savings?")).toEqual({
      before: "Ready to see ",
      accent: "your savings?",
      after: "",
    });
  });

  it("splits around an accent at the START, which is where a Kannada noun phrase sits", () => {
    // "Adopt rooftop solar across Karnataka" — the emphasis is the place, and the verb is last.
    const text = "ಕರ್ನಾಟಕದಾದ್ಯಂತ ಸೌರ ವಿದ್ಯುತ್ ಅಳವಡಿಸಿಕೊಳ್ಳಿ";
    expect(splitOnAccent(text, "ಕರ್ನಾಟಕದಾದ್ಯಂತ")).toEqual({
      before: "",
      accent: "ಕರ್ನಾಟಕದಾದ್ಯಂತ",
      after: " ಸೌರ ವಿದ್ಯುತ್ ಅಳವಡಿಸಿಕೊಳ್ಳಿ",
    });
  });

  it("splits around an accent in the middle", () => {
    expect(splitOnAccent("More than solar. A better energy future.", "solar.")).toEqual({
      before: "More than ",
      accent: "solar.",
      after: " A better energy future.",
    });
  });

  it("accepts a single-word accent covering the whole headline", () => {
    expect(splitOnAccent("ಮುಖಪುಟ", "ಮುಖಪುಟ")).toEqual({ before: "", accent: "ಮುಖಪುಟ", after: "" });
  });

  it("returns null when no accent is given, so the caller keeps its position rule", () => {
    expect(splitOnAccent("Talk to us about your roof.", undefined)).toBeNull();
    expect(splitOnAccent("Talk to us about your roof.", "")).toBeNull();
  });

  it("returns null when the accent no longer appears in the copy", () => {
    // A copy edit that orphans the accent must degrade to a plain headline, never crash.
    expect(splitOnAccent("Talk to us about your roof.", "your rooftop.")).toBeNull();
  });

  it("uses the first occurrence when the accent repeats", () => {
    expect(splitOnAccent("solar and more solar", "solar")).toEqual({
      before: "",
      accent: "solar",
      after: " and more solar",
    });
  });
});

describe("English headlines are split exactly as the positional rule split them", () => {
  for (const heading of HEADINGS) {
    it(heading.where, () => {
      const explicit = splitOnAccent(heading.title, heading.accent);
      expect(explicit, "the accent is not part of its own title").not.toBeNull();
      expect(explicit).toEqual(positional(heading.title, heading.words));
    });
  }
});
