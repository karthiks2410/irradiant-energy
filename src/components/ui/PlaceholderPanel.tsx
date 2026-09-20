import { showPlaceholders } from "@/lib/env";

type Aspect = "16/9" | "21/9" | "3/2" | "4/5" | "1/1" | "fill";

const aspects: Record<Aspect, string> = {
  "16/9": "aspect-video",
  "21/9": "aspect-21/9",
  "3/2": "aspect-3/2",
  "4/5": "aspect-4/5",
  "1/1": "aspect-square",
  fill: "absolute inset-0 h-full w-full",
};

// The brand PDF's own placeholder treatment: a hatched Deep Teal panel (report §6.13).
const hatch = "repeating-linear-gradient(135deg, transparent 0 14px, rgb(246 247 242 / 0.07) 14px 15px)";

type PlaceholderPanelProps = {
  /** What the approved photo will show, e.g. "Rooftop array on an Anekal home". */
  subject: string;
  aspect?: Aspect;
  /** Production has no placeholders: render nothing (default) or a plain Deep Teal block. */
  fallback?: "none" | "solid";
  className?: string;
};

/** Honest photo placeholder; visible only where showPlaceholders is true (never in production). */
export function PlaceholderPanel({ subject, aspect = "16/9", fallback = "none", className = "" }: PlaceholderPanelProps) {
  const shape = `${aspects[aspect]} rounded-md bg-teal-950 ${className}`;
  if (!showPlaceholders) return fallback === "solid" ? <div aria-hidden="true" className={shape} /> : null;
  return (
    <div
      role="img"
      aria-label={`Placeholder for approved photography: ${subject}`}
      className={`relative overflow-hidden ${shape}`}
      style={{ backgroundImage: hatch }}
    >
      <p className="absolute inset-x-4 bottom-4 font-mono text-label text-on-dark-muted">[APPROVED PHOTOGRAPHY] · {subject}</p>
    </div>
  );
}
