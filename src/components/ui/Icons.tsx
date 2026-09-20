/**
 * Monoline UI glyphs (brand PDF p.57): 1.75 stroke, round caps, currentColor, always decorative.
 *
 * `FeatureIcon` is keyed by the content layer's IconKey, so content decides which glyph a card
 * shows and no page hard-codes the mapping. It lives here rather than beside a page because the
 * same cards render in more than one place: `proofFallback` re-exports the home page's "why"
 * cards onto the Business page, and two local icon sets drew those six keys differently.
 */

import type { ReactNode } from "react";
import type { IconKey } from "@/content/types";

type IconProps = { className?: string };

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const glyphs: Record<IconKey, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.5 12h2M19.5 12h2M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
    </>
  ),
  battery: (
    <>
      <rect x="2.5" y="7" width="16" height="10" rx="2.5" />
      <path d="M21.5 10.5v3M6 11h4" />
    </>
  ),
  charge: <path d="M13.5 2.5 5 13.5h5.5L10 21.5l8.5-11H13l.5-8Z" />,
  monitor: (
    <>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 21h7M12 17v4" />
      <path d="M6.5 12.5 9.5 9.5l2.5 2.5 4-4.5" />
    </>
  ),
  site: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20.5h13V9.5" />
      <path d="M9.5 20.5V15h5v5.5" />
    </>
  ),
  doc: (
    <>
      <path d="M13.5 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5.5-5.5Z" />
      <path d="M13.5 2.5V8H19" />
      <path d="M8.5 13h7M8.5 17h4.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.5 4.5 5.5v5.9c0 4.4 3 8.5 7.5 10.1 4.5-1.6 7.5-5.7 7.5-10.1V5.5L12 2.5Z" />
      <path d="m9 11.8 2.2 2.2L15.2 10" />
    </>
  ),
  tools: (
    <>
      <circle cx="12" cy="12" r="3.25" />
      <path d="M19.3 14.6a1.6 1.6 0 0 0 .3 1.8l.1.1a1.95 1.95 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a1.95 1.95 0 0 1-3.9 0v-.1a1.6 1.6 0 0 0-2.7-1.2l-.1.1a1.95 1.95 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.2a1.95 1.95 0 0 1 0-3.9h.1a1.6 1.6 0 0 0 1.2-2.7l-.1-.1a1.95 1.95 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.2a1.95 1.95 0 0 1 3.9 0v.1a1.6 1.6 0 0 0 2.7 1.2l.1-.1a1.95 1.95 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a1.95 1.95 0 0 1 0 3.9h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  dash: (
    <>
      <path d="M3.5 18a8.5 8.5 0 1 1 17 0" />
      <path d="m12 18 4-5.2" />
      <circle cx="12" cy="18" r="1" />
    </>
  ),
  support: (
    <>
      <path d="M4 13.5v-1.2a8 8 0 0 1 16 0v1.2" />
      <path d="M4 13h2.5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2v-4Z" />
      <path d="M20 13h-2.5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h.5a2 2 0 0 0 2-2v-4Z" />
    </>
  ),
};

/** Renders the glyph a content item asked for; nothing when the item has no icon. */
export function FeatureIcon({ name, className }: { name?: IconKey; className?: string }) {
  if (!name) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      {glyphs[name]}
    </svg>
  );
}

/** Checklist marker for "what's included" and similar lists. */
export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} {...strokeProps}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function ErrorIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} {...strokeProps}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.75v3.75M8 11.25h.01" />
    </svg>
  );
}
