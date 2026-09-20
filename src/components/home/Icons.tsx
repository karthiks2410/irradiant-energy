/**
 * Home-page-only glyphs: the hero slideshow's transport controls. These are solid rather than
 * monoline because they are a media control, not a feature mark.
 *
 * The shared monoline set (FeatureIcon, CheckIcon) lives in src/components/ui/Icons.tsx, so the
 * home page and the audience pages draw the same content keys identically.
 */

type IconProps = { className?: string };

export function PauseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <rect x="6.5" y="4.5" width="4" height="15" rx="1.25" />
      <rect x="13.5" y="4.5" width="4" height="15" rx="1.25" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M7.5 4.8a1 1 0 0 1 1.5-.87l11 7.2a1 1 0 0 1 0 1.74l-11 7.2a1 1 0 0 1-1.5-.87V4.8Z" />
    </svg>
  );
}
