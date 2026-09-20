import { showPlaceholders } from "@/lib/env";

/**
 * Marks a fact the owner has not supplied yet. Visible only outside production
 * (lib/env.ts), so nothing unconfirmed can reach a live page.
 *
 * Solar Yellow is never text on a light surface (report §6.4), so the tag is a chip:
 * yellow fill with Deep Teal text, which reads on canvas, white and teal alike.
 */
export function PlaceholderTag({ children }: { children: string }) {
  if (!showPlaceholders) return null;
  return (
    <span className="inline-block rounded-sm bg-yellow-400 px-1.5 py-0.5 align-middle font-mono text-label font-medium text-teal-900 uppercase">
      [{children}]
    </span>
  );
}
