/**
 * Indian-rupee formatting with lakh/crore grouping (`en-IN`). Dynamic figures only; static
 * copy such as "₹78,000" stays as written. Ported from the legacy site (05 §17.1 P3).
 */

const GROUPED = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/**
 * How a lakh and a crore are named.
 *
 * English appends a letter, so the old code could build "₹8.2L" by concatenation. Kannada names
 * them with a word — "₹8.2 ಲಕ್ಷ" — which is copy, and copy cannot be a suffix hard-coded in a
 * formatter. So the caller passes the two templates (`content.quote.format`), `{amount}` is the
 * grouped number, and the ₹ lives in the template because that is where a translator can move it.
 *
 * The grouping itself stays `en-IN` in both locales: `kn-IN` groups in thousands, which is not
 * how a reader in Karnataka reads a rupee figure (docs/kannada/research/architecture.md §6.7).
 */
export interface CompactInrSuffixes {
  /** From one lakh: "₹{amount}L". */
  lakh: string;
  /** From one crore: "₹{amount}Cr". */
  crore: string;
}

/** English, so a call site that has no copy to hand still prints what it always printed. */
export const EN_COMPACT_INR: CompactInrSuffixes = { lakh: "₹{amount}L", crore: "₹{amount}Cr" };

export interface FormatInrOptions {
  /**
   * ₹8.2L / ₹1.25Cr for values from one lakh upwards; smaller values stay grouped. `true` uses
   * the English suffixes; pass the locale's own to render them in its words.
   *
   * `bare` has no effect on a value that reaches a suffix: the template owns the ₹ sign.
   */
  compact?: boolean | CompactInrSuffixes;
  /** Omit the ₹ sign. */
  bare?: boolean;
}

/** "—" for missing or non-finite values, so a tile never shows "₹NaN". */
export function formatInr(value: number | null | undefined, options: FormatInrOptions = {}): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const symbol = options.bare ? "" : "₹";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  if (options.compact) {
    const suffixes = options.compact === true ? EN_COMPACT_INR : options.compact;
    if (abs >= 1_00_00_000) {
      return sign + suffixes.crore.replace("{amount}", trimZeros((abs / 1_00_00_000).toFixed(2)));
    }
    if (abs >= 1_00_000) return sign + suffixes.lakh.replace("{amount}", trimZeros((abs / 1_00_000).toFixed(1)));
  }
  return `${sign}${symbol}${GROUPED.format(abs)}`;
}

/** "4.0" → "4", "1.25" stays "1.25". */
function trimZeros(fixed: string): string {
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}
