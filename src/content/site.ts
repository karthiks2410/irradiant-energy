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

export const site = {
  name: "Irradiant Energy",
  legacyName: "Irradiant Energie",
  tagline: "Energy Made Intelligent", // brand PDF p.5
  description:
    "Rooftop solar for homes, housing societies and businesses in Bengaluru — designed, installed and supported by Irradiant Energy.",

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

  /** New profiles are being created; the old business's accounts are deliberately not linked. */
  social: [] as { label: string; href: string }[],
} as const;

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
