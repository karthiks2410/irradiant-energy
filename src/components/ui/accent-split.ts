/**
 * Where the green half of a two-tone headline starts and stops.
 *
 * Both headline components derive the accent from word POSITION — the last N words
 * (`AccentTitle`) or the last word (`AccentedTitle`). In English that is reliable, because the
 * phrase the brand wants emphasised lands at the end: "Solar for your home, society or business
 * **in Karnataka.**"
 *
 * In Kannada it is wrong (layout-risks.md M9). The verb goes last, so a last-N-words rule paints
 * the verb green and leaves the noun phrase — the thing being emphasised — in ink. Kannada also
 * compounds, so the same phrase is often a single word and a `tail = 2` rule swallows the whole
 * line.
 *
 * So the accent becomes an explicit substring the copy carries, per locale, and this function
 * finds it. Position-derived behaviour stays the default, which is why English output does not
 * move: with no `accent` given, the components take their original branch untouched.
 */
export interface AccentSplit {
  /** Text before the accent, including any space that separated them. */
  before: string;
  /** The accented run, exactly as it was asked for. */
  accent: string;
  /** Text after the accent. Usually empty in English, often non-empty in Kannada. */
  after: string;
}

/**
 * Split `text` around the first occurrence of `accent`.
 *
 * Returns null when the accent is empty or is not present, so the caller can fall back rather
 * than silently render a headline with no emphasis. A copy edit that breaks the match is then
 * visible as a plain headline, never as a crash or a wrongly coloured phrase.
 */
export function splitOnAccent(text: string, accent: string | undefined): AccentSplit | null {
  if (!accent) return null;
  const index = text.indexOf(accent);
  if (index === -1) return null;
  return { before: text.slice(0, index), accent, after: text.slice(index + accent.length) };
}
