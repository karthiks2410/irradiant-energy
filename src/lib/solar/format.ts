/**
 * Indian-rupee formatting with lakh/crore grouping (`en-IN`). Dynamic figures only; static
 * copy such as "₹78,000" stays as written. Ported from the legacy site (05 §17.1 P3).
 */

const GROUPED = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export interface FormatInrOptions {
  /** ₹8.2L / ₹1.25Cr for values from one lakh upwards; smaller values stay grouped. */
  compact?: boolean;
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
    if (abs >= 1_00_00_000) return `${sign}${symbol}${trimZeros((abs / 1_00_00_000).toFixed(2))}Cr`;
    if (abs >= 1_00_000) return `${sign}${symbol}${trimZeros((abs / 1_00_000).toFixed(1))}L`;
  }
  return `${sign}${symbol}${GROUPED.format(abs)}`;
}

/** "4.0" → "4", "1.25" stays "1.25". */
function trimZeros(fixed: string): string {
  return fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
}
