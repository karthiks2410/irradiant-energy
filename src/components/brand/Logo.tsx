import { showPlaceholders } from "@/lib/env";

/**
 * Logo artwork (docs/decisions.md D-005).
 * - LogoSymbol: the approved symbol, copied verbatim from the owner-supplied master
 *   ("logo svg/Favicon.svg"); only the fill is switched to currentColor.
 * - LogoLockup: a TEMPORARY placeholder (symbol + wordmark in the display face). The
 *   supplied full lockup has un-outlined text, and the brand rules forbid retyping the
 *   logo, so the real lockup is swapped in here once the outlined SVG arrives.
 */

type LogoProps = { className?: string; title?: string };

export function LogoSymbol({ className, title = "Irradiant Energy", decorative = false }: LogoProps & { decorative?: boolean }) {
  return (
    <svg
      viewBox="24 24 52 52"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative || undefined}
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M60,48.69c-5.23-5.26-13.6-5.47-18.95-.33l-4.5,4.47c-.49.48-1.26.75-1.94.75h-7.02c-.92,0-1.6-.74-1.6-1.64v-3.75c0-.7.53-1.66,1.37-1.66h12.8c.23-.01.57-.21.67-.37.1-.17.08-.59-.1-.78l-9.11-9.16c-.51-.52-.34-1.59.11-2.04l2.79-2.79c.68-.69,1.7-.54,2.34.11l8.79,8.81c.18.18.57.27.77.2.18-.06.42-.41.42-.66v-12.48c0-.9.56-1.75,1.53-1.75h3.97c.88,0,1.54.78,1.54,1.63v12.6c0,.26.22.62.41.68.27.08.62-.03.85-.27l8.85-8.88c.56-.56,1.57-.6,2.12-.05l2.9,2.92c.69.7.37,1.71-.25,2.32l-8.73,8.75c-.19.19-.29.57-.22.75.1.23.43.45.71.45h12.69c.89,0,1.47.9,1.47,1.68v3.74c0,.99-.76,1.65-1.72,1.65h-6.89c-.73-.01-1.52-.31-2.02-.81l-4.07-4.09Z" />
      <path d="M48.76,56.69l-9.41,9.44-3.77,3.73-4.97-5,12.72-12.89c3.85-3.9,9.84-4.29,13.69-.21l13.04,13.08-5.02,5.04-13.19-13.23c-.91-.94-2.16-.91-3.1.03" />
      <path d="M53.87,74.47h-7.09s.03-3.82.03-3.82c.02-1.87,1.7-3.26,3.45-3.29,1.81-.03,3.56,1.38,3.58,3.29l.03,3.82Z" />
    </svg>
  );
}

export function LogoLockup({ className = "", title = "Irradiant Energy" }: LogoProps) {
  return (
    <span role="img" aria-label={title} className={`relative inline-flex h-12 items-center gap-2.5 ${className}`}>
      <LogoSymbol decorative className="h-full w-auto shrink-0" />
      <span aria-hidden="true" className="flex flex-col justify-center leading-none">
        <span className="font-display text-[1.375rem] font-bold tracking-tight">Irradiant</span>
        <span className="mt-0.5 font-mono text-[0.625rem] font-medium tracking-[0.2em] uppercase">Energy</span>
      </span>
      {/* Outside production, a dashed outline marks the wordmark as a stand-in for the real lockup.
          It must not be text: any text here joins the link's visible label and no longer matches
          its accessible name (axe label-content-name-mismatch). */}
      {showPlaceholders && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-sm border border-dashed border-yellow-400/60" />
      )}
    </span>
  );
}
