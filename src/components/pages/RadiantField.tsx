import { LogoSymbol } from "@/components/brand/Logo";

/**
 * Radiant Field (brand PDF p.53; docs/design-system.md §6.3): a cropped, oversized fragment of
 * the approved logo symbol used as a quiet background device. It is *derived* from the symbol —
 * the official logo itself is never altered — and it is decorative, so it is `aria-hidden` and
 * carries no accessible name.
 *
 * Rules kept here:
 * - Tonal strength only (the PDF allows 8–16% on a coloured surface). 15% Radiant Green on Deep
 *   Teal is the quiet end of that range, so the fragment never competes with the headline it
 *   sits behind (p.53 "never let the field compete with information").
 * - **One field per surface.** The caller must not place a second device on the same band; the
 *   inner-page hero renders the field only when it has no photograph.
 * - Cropped, not tiled: the parent clips it, so what shows is a fragment of the ray fan rather
 *   than a repeated logo (p.53 "never repeat the full logo as wallpaper").
 */
export function RadiantField({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 overflow-hidden ${className}`}>
      {/* Scaled to roughly twice the band's height and pushed past the top, bottom and right
          edges of its box, so what stays in frame is a slice of the ray fan — a fragment, not a
          logo sitting in the corner. */}
      <LogoSymbol
        decorative
        className="absolute -top-[45%] left-[28%] h-[190%] w-auto text-green-500/15"
      />
    </div>
  );
}
