/**
 * Single source of truth for business facts shown anywhere on the site.
 *
 * Status legend (see docs/content-inventory.md):
 * - "verified-live": carried over from the live legacy site.
 * - "owner-confirmed": confirmed by the owner in writing (date in the comment beside the fact).
 * - "to-confirm": carried over but awaiting owner confirmation (decisions.md D-009).
 * - null value: not known yet; the UI shows a placeholder in preview and hides it in production.
 */

export type FactStatus = "verified-live" | "owner-confirmed" | "to-confirm";

/** True for facts that may be shown as verified (on the site, in JSON-LD, in emails). */
export const isConfirmed = (status: FactStatus) => status !== "to-confirm";

export interface Fact<T> {
  value: T;
  status: FactStatus;
}

/** Networks we hold an official brand mark for (src/components/ui/SocialIcons.tsx). */
export type SocialPlatform = "linkedin" | "instagram" | "facebook" | "x";

export interface SocialProfile {
  platform: SocialPlatform;
  /** Network name; the accessible name is built from it ("Irradiant Energy on LinkedIn"). */
  label: string;
  href: string;
}

export interface PendingSocialProfile {
  platform: SocialPlatform;
  label: string;
  /** Why it is not a link yet. Read out as part of the accessible name. */
  note: string;
}

export const site = {
  name: "Irradiant Energy",
  legacyName: "Irradiant Energie",
  tagline: "Energy Made Intelligent", // brand PDF p.5
  description:
    "Rooftop solar for homes, housing societies and businesses across Karnataka — designed, installed and supported by Irradiant Energy.",

  contact: {
    // Both numbers confirmed by the owner on 2026-09-19. Primary = the WhatsApp line used on the old site.
    phonePrimary: {
      value: { display: "+91 98457 94343", tel: "+919845794343" },
      status: "owner-confirmed",
    } satisfies Fact<{ display: string; tel: string }>,
    phoneSecondary: {
      value: { display: "+91 98456 94343", tel: "+919845694343" },
      status: "owner-confirmed",
    } satisfies Fact<{ display: string; tel: string }>,
    // contact@ for public enquiries, admin@ for administration, leads@ for form submissions —
    // all aliases on one inbox, so mail can be filtered by purpose (owner, 2026-09-20).
    email: { value: "contact@irradiantenergy.in", status: "owner-confirmed" } satisfies Fact<string>,
    whatsapp: { value: "919845794343", status: "owner-confirmed" } satisfies Fact<string>,
    address: {
      value: {
        lines: ["7/241, Gopi Layout, Attibele Main Road", "Anekal, Bengaluru, Karnataka 562106"],
        locality: "Anekal",
        region: "Karnataka",
        postalCode: "562106",
        country: "IN",
      },
      status: "owner-confirmed", // confirmed by the owner on 2026-09-19
    },
    // Owner instruction (2026-09-19): the business is reachable at all times and business hours
    // must NOT be shown anywhere on the site — no hours line, no "24/7" or "always available" claim.
  },

  legal: {
    // Owner-confirmed 2026-09-20.
    entityName: "Irradiant Energy Innovations Private Limited" as string | null,
    gstin: null as string | null,
    cin: null as string | null,
    grievanceOfficer: { name: "Keerthi Raj", email: "admin@irradiantenergy.in" } as { name: string; email: string } | null,
  },

  /**
   * The new business's own profiles, supplied by the owner on 2026-09-20 and now live. The old
   * business's accounts stay unlinked (D-011: the two are kept separate through the transition).
   *
   * The URLs are used VERBATIM as the owner sent them, so the Instagram and Facebook entries keep
   * the share/tracking parameters they arrived with (`stkn=`, `mibextid=`). Those are the links the
   * owner verified resolve; canonical profile URLs are pending (see owner to-dos).
   *
   * Only entries in this array are rendered as links, and only these reach the Organization
   * `sameAs` graph in components/seo/JsonLd.tsx — an unclaimed handle must never be asserted there.
   */
  social: [
    { platform: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/irradiant-energy-1873aa422/" },
    {
      platform: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/irradiant.energy?stkn=MXd5b3ZucTNlZnZxdw==",
    },
    { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1BBwhFwtQx/?mibextid=wwXIfr" },
  ] as SocialProfile[],
} as const;

/**
 * Shown beside the live profiles but never linked — owner instruction, 2026-09-20: "put twitter as
 * well: do not link it now, let it be dummy for now". Kept out of `site.social` on purpose so it
 * cannot leak into JSON-LD `sameAs`, and rendered as an inert, visibly muted control.
 */
export const socialPending: PendingSocialProfile[] = [{ platform: "x", label: "X", note: "coming soon" }];

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.contact.whatsapp.value}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavLink[];
}

/** Offerings live today (D-009: rooftop solar only). Batteries, VPP etc. are added here later. */
export const solutions: NavGroup = {
  label: "Solutions",
  items: [
    { label: "Homes", href: "/solutions/solar/home", description: "Rooftop solar for individual homes and villas" },
    {
      label: "Housing societies",
      href: "/solutions/solar/housing-society",
      description: "Shared rooftop solar for apartments and gated communities",
    },
    {
      label: "Business",
      href: "/solutions/solar/commercial",
      description: "Solar for shops, offices, factories and warehouses",
    },
  ],
};

/** Header order mirrors the design prototype: Home · About · Solutions · Calculator · Contact. */
export const nav: (NavLink | NavGroup)[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  solutions,
  { label: "Calculator", href: "/get-quote" },
  { label: "Contact", href: "/contact" },
];

export const isNavGroup = (item: NavLink | NavGroup): item is NavGroup => "items" in item;

export const primaryCta: NavLink = { label: "Get a free estimate", href: "/get-quote" };
