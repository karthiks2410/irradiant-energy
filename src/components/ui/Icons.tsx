/**
 * Monoline UI glyphs, drawn by lucide-react at stroke 1.75 (owner direction — the same weight
 * their PinselParty project uses, and within the brand PDF p.57 monoline spec: round caps and
 * joins, currentColor, never inside a circle or a tinted container).
 *
 * `FeatureIcon` is keyed by the content layer's IconKey, so content decides which glyph a card
 * shows and no page hard-codes the mapping. It lives here rather than beside a page because the
 * same cards render in more than one place: `proofFallback` re-exports the home page's "why"
 * cards onto the Business page, and two local icon sets drew those six keys differently.
 *
 * Icons are imported one by one (never `import * as`) so Next's optimizePackageImports — which
 * lists lucide-react by default — pulls in only the modules below.
 *
 * Size comes from the consumer's className (size-4/5 in UI chrome, size-8 on feature cards), not
 * from lucide's `size` prop: a Tailwind `size-*` rule beats the width/height attributes lucide
 * writes, and it keeps the existing `[&>svg]:size-8` card rule working.
 */

import {
  Activity,
  Briefcase,
  Building2,
  MessageCircle,
  Phone,
  ArrowRight,
  BatteryCharging,
  Check,
  ChevronDown,
  CircleAlert,
  EvCharger,
  FileText,
  Gauge,
  Headset,
  House,
  ShieldCheck,
  Sun,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/content/types";

type IconProps = { className?: string };

/** Brand monoline weight. Matches the owner's reference set; do not vary per icon. */
const strokeWidth = 1.75;

const glyphs: Record<IconKey, LucideIcon> = {
  /** "Generate" — solar production. */
  sun: Sun,
  /** "Store" — battery-ready pathways. */
  battery: BatteryCharging,
  /** "Charge" — EV charging. */
  charge: EvCharger,
  /** "Monitor" — generation and performance over time. */
  monitor: Activity,
  /** Site-based design; the roof the system is drawn around. */
  site: House,
  /** Written proposal / savings model. */
  doc: FileText,
  /** Quality equipment, warranty, paperwork handled. */
  shield: ShieldCheck,
  /** Installation, commissioning, maintenance. */
  tools: Wrench,
  /** Digital monitoring dashboard. */
  dash: Gauge,
  /** Long-term service and after-sales. */
  support: Headset,
};

/** Renders the glyph a content item asked for; nothing when the item has no icon. */
export function FeatureIcon({ name, className }: { name?: IconKey; className?: string }) {
  if (!name) return null;
  const Glyph = glyphs[name];
  return <Glyph aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

/** Checklist marker for "what's included" and similar lists. */
export function CheckIcon({ className }: IconProps) {
  return <Check aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

export function ArrowRightIcon({ className }: IconProps) {
  return <ArrowRight aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

export function ChevronDownIcon({ className }: IconProps) {
  return <ChevronDown aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

export function ErrorIcon({ className }: IconProps) {
  return <CircleAlert aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

export function PhoneIcon({ className }: IconProps) {
  return <Phone aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

/**
 * Stands in for WhatsApp. Deliberately the generic message glyph rather than the WhatsApp mark:
 * the brand's logo is theirs, its use is governed by their brand rules, and a monoline redraw of
 * a trademark is the kind of thing that gets a site a letter. The link text names WhatsApp.
 */
export function ChatIcon({ className }: IconProps) {
  return <MessageCircle aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

/** Audience marks for the Solutions menu: a house, an apartment block, a business. */
export function HomeAudienceIcon({ className }: IconProps) {
  return <House aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

export function SocietyAudienceIcon({ className }: IconProps) {
  return <Building2 aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}

export function BusinessAudienceIcon({ className }: IconProps) {
  return <Briefcase aria-hidden="true" strokeWidth={strokeWidth} className={className} />;
}
