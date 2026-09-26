/**
 * The logo symbol for generated images (OG cards, app icons). Satori, which renders those, needs
 * an explicit size and fill on the <svg>, so it cannot reuse <LogoSymbol/> (className +
 * currentColor). The path data is the D-005 master in src/components/brand/symbol.ts, which the
 * favicon generator (scripts/generate-icons.ts) reads too.
 */
import { SYMBOL_PATHS as paths } from "@/components/brand/symbol";

export function BrandMark({ size, fill }: { size: number; fill: string }) {
  return (
    <svg width={size} height={size} viewBox="24 24 52 52" xmlns="http://www.w3.org/2000/svg">
      {paths.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </svg>
  );
}
