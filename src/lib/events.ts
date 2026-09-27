/**
 * The Google Analytics events this site sends, and the rules that keep personal data out of them.
 *
 * Framework-free and pure, like src/lib/consent.ts: no React, no DOM access, so every rule here is
 * unit-tested in Node (src/lib/events.test.ts). The runtime that actually sends is `track()` in
 * src/lib/gtag.ts, which runs every event through `scrubParams` below first.
 *
 * The privacy rule, in one line: an event carries labels we chose, never something a visitor typed.
 * So every parameter has a closed list of values (or a pattern that only our own ids can match),
 * and anything else is dropped before it reaches Google — a name, a phone number, an email address,
 * a PIN code or an exact bill cannot pass, whatever a caller hands in by mistake.
 *
 * Event names and parameter names are what the GA4 admin sees; renaming one breaks the owner's
 * Key events and custom dimensions (integrations/google-sheet/README.md is the Sheet, the GA steps
 * are in the hand-off notes). Treat them as a public contract.
 */

import type { Locale } from "@/i18n/config";

/** Where a contact link sits. Marked with `data-track-location` on the element or an ancestor. */
export const LINK_LOCATIONS = ["header", "footer", "bubble", "contact", "popup", "result", "page"] as const;
export type LinkLocation = (typeof LINK_LOCATIONS)[number];

/** Which button opened the quote popup. */
export const QUOTE_PLACEMENTS = ["header", "hero", "segment", "closing", "menu", "other"] as const;
export type QuotePlacement = (typeof QUOTE_PLACEMENTS)[number];

/**
 * Which form an enquiry came through: the quote popup, the popup opened for a site visit, the quote
 * form on the home page (the same form as the popup, always open; owner decision 2026-09-27), and
 * the estimate form on /get-quote.
 */
export const LEAD_FORMS = ["popup", "site_visit", "home", "calculator"] as const;
export type LeadFormName = (typeof LEAD_FORMS)[number];

export const QUOTE_INTENTS = ["quote", "site_visit"] as const;
export type QuoteIntentParam = (typeof QUOTE_INTENTS)[number];

export const SOCIAL_NETWORKS = ["linkedin", "instagram", "facebook", "x", "youtube"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const PAGE_TYPES = ["home", "solutions", "segment", "calculator", "about", "contact", "legal", "other"] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const PROPERTY_TYPES = ["home", "housing-society", "commercial"] as const;

const LANGUAGES: readonly Locale[] = ["en", "kn"];

/** "English" | "Kannada": GA4's built-in Content group dimension, on every page view and event. */
export const CONTENT_GROUPS = ["English", "Kannada"] as const;
export type ContentGroup = (typeof CONTENT_GROUPS)[number];

/**
 * A bill as a band, never as the amount typed: the popup's bucket ids (src/lib/leads/quick.ts,
 * "home-3", "society-1", "business-5"), or "unknown" when the calculator has no usable bill.
 */
export const BILL_BAND_RE = /^(?:home|society|business)-[1-9]$|^unknown$/;

/**
 * Every event and the parameters its caller supplies. `site_language` is the language of the page
 * the visitor is on, "en" or "kn".
 *
 * Why `site_language` and not `language`: in GA4, `language` is a reserved field. gtag.js does not
 * send it as an event parameter at all; it overwrites the hit's browser-language field (`ul`)
 * instead, so it would never reach a report and would corrupt the built-in Language dimension
 * (seen in local testing, 2026-09-26). `site_language` arrives as an ordinary parameter.
 *
 * `track` adds two more to every event: `page_type` and `content_group` of the page it happened on
 * (see TRACK_CONTEXT_PARAMS). GA4 does not carry values set with gtag('set') into later events, so
 * they are attached to each one explicitly.
 */
export interface EventParams {
  generate_lead: { form: LeadFormName; property_type: string; bill_band: string; site_language: Locale };
  email_estimate: { site_language: Locale };
  click_call: { location: LinkLocation; site_language: Locale };
  click_whatsapp: { location: LinkLocation; site_language: Locale };
  click_email: { location: LinkLocation; site_language: Locale };
  open_quote: { intent: QuoteIntentParam; button: QuotePlacement; site_language: Locale };
  use_calculator: { property_type: string; bill_band: string; site_language: Locale };
  switch_language: { from: Locale; to: Locale };
  click_social: { network: SocialNetwork };
}

export type EventName = keyof EventParams;

type Rule = readonly string[] | RegExp;

/** The allowed values of each parameter. A parameter that is not listed is dropped. */
const PARAM_RULES: Readonly<Record<string, Rule>> = {
  form: LEAD_FORMS,
  property_type: PROPERTY_TYPES,
  bill_band: BILL_BAND_RE,
  site_language: LANGUAGES,
  page_type: PAGE_TYPES,
  content_group: CONTENT_GROUPS,
  location: LINK_LOCATIONS,
  intent: QUOTE_INTENTS,
  button: QUOTE_PLACEMENTS,
  from: LANGUAGES,
  to: LANGUAGES,
  network: SOCIAL_NETWORKS,
};

/** Which parameters each event may carry. */
const EVENT_PARAMS: Readonly<Record<EventName, readonly string[]>> = {
  generate_lead: ["form", "property_type", "bill_band", "site_language"],
  email_estimate: ["site_language"],
  click_call: ["location", "site_language"],
  click_whatsapp: ["location", "site_language"],
  click_email: ["location", "site_language"],
  open_quote: ["intent", "button", "site_language"],
  use_calculator: ["property_type", "bill_band", "site_language"],
  switch_language: ["from", "to"],
  click_social: ["network"],
};

export const EVENT_NAMES = Object.keys(EVENT_PARAMS) as EventName[];

export function isEventName(value: unknown): value is EventName {
  // hasOwnProperty, not Object.hasOwn: the latter is missing from Safari before 15.4.
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(EVENT_PARAMS, value);
}

function allowed(rule: Rule, value: string): boolean {
  return rule instanceof RegExp ? rule.test(value) : rule.includes(value);
}

/**
 * The parameters that may leave for Google: only the ones this event declares, and only values on
 * that parameter's list. Everything else — an unexpected key, free text, a number — is dropped
 * silently. Returns null for an event name that is not ours.
 */
export function scrubParams(name: string, params: Readonly<Record<string, unknown>>): Record<string, string> | null {
  if (!isEventName(name)) return null;
  const clean: Record<string, string> = {};
  for (const key of EVENT_PARAMS[name]) {
    const value = params[key];
    const rule = PARAM_RULES[key];
    if (typeof value === "string" && rule && allowed(rule, value)) clean[key] = value;
  }
  return clean;
}

/**
 * The page context `track` attaches to every event: which kind of page and which language group.
 * Derived from the path, so a caller can neither forget it nor put anything else in it.
 */
export function trackContext(pathname: string): { page_type: PageType; content_group: ContentGroup } {
  return { page_type: pageTypeOf(pathname), content_group: contentGroupOf(pathname) };
}

/* ------------------------------------------------------------------ links */

export type LinkEvent =
  | { event: "click_call" | "click_whatsapp" | "click_email" }
  | { event: "click_social"; network: SocialNetwork };

const WHATSAPP_HOSTS = new Set(["wa.me", "api.whatsapp.com", "web.whatsapp.com", "chat.whatsapp.com", "whatsapp.com"]);

const SOCIAL_HOSTS: Readonly<Record<string, SocialNetwork>> = {
  "linkedin.com": "linkedin",
  "instagram.com": "instagram",
  "facebook.com": "facebook",
  "fb.com": "facebook",
  "x.com": "x",
  "twitter.com": "x",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
};

/**
 * What a click on a link to `href` counts as, or null for a link we do not count. Only the scheme
 * and the host are read: the rest of the address (a WhatsApp prefill, an email address) is never
 * part of an event.
 */
export function classifyLink(href: string): LinkEvent | null {
  const trimmed = href.trim();
  const scheme = trimmed.slice(0, trimmed.indexOf(":") + 1).toLowerCase();
  if (scheme === "tel:") return { event: "click_call" };
  if (scheme === "mailto:") return { event: "click_email" };
  if (scheme === "whatsapp:") return { event: "click_whatsapp" };
  if (scheme !== "https:" && scheme !== "http:") return null;

  let host: string;
  try {
    host = new URL(trimmed).hostname.toLowerCase().replace(/^(?:www|m|mobile)\./, "");
  } catch {
    return null;
  }
  if (WHATSAPP_HOSTS.has(host)) return { event: "click_whatsapp" };
  const network = SOCIAL_HOSTS[host];
  return network ? { event: "click_social", network } : null;
}

/** A marked location, or the page's own default: the contact page is "contact", anywhere else "page". */
export function linkLocation(marked: string | null | undefined, pageType: PageType): LinkLocation {
  if (marked && (LINK_LOCATIONS as readonly string[]).includes(marked)) return marked as LinkLocation;
  return pageType === "contact" ? "contact" : "page";
}

/** One event, ready for `track`. */
export type TrackCall = { [N in EventName]: { name: N; params: EventParams[N] } }[EventName];

/**
 * What a click on a link is worth, from plain facts so it can be tested without a DOM:
 * - `href` — the link's own href attribute;
 * - `marked` — the nearest `data-track-location` value on the link or an ancestor, if any;
 * - `pathname` — the page the click happened on;
 * - `switchTo` — the `lang` of a link inside the language switch ("kn", or a regional tag such as
 *   "kn-IN", which counts as "kn"), otherwise null.
 */
export function describeLinkClick({
  href,
  marked,
  pathname,
  switchTo,
}: {
  href: string;
  marked?: string | null;
  pathname: string;
  switchTo?: string | null;
}): TrackCall | null {
  const language = languageOf(pathname);
  if (switchTo) {
    const tag = switchTo.split("-")[0].toLowerCase();
    const to = (LANGUAGES as readonly string[]).includes(tag) ? (tag as Locale) : null;
    return to && to !== language ? { name: "switch_language", params: { from: language, to } } : null;
  }
  const link = classifyLink(href);
  if (!link) return null;
  if (link.event === "click_social") return { name: "click_social", params: { network: link.network } };
  return { name: link.event, params: { location: linkLocation(marked, pageTypeOf(pathname)), site_language: language } };
}

/* ------------------------------------------------------------------ pages */

/** The locale prefix of a pathname; English when it has none. */
export function languageOf(pathname: string): Locale {
  return /^\/kn(?:\/|$)/.test(pathname) ? "kn" : "en";
}

export function contentGroupOf(pathname: string): ContentGroup {
  return languageOf(pathname) === "kn" ? "Kannada" : "English";
}

/** The kind of page, from its path without the locale prefix. */
export function pageTypeOf(pathname: string): PageType {
  const path = pathname.replace(/^\/(?:en|kn)(?=\/|$)/, "").replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (path === "/solutions") return "solutions";
  if (/^\/solutions\/solar\/[^/]+$/.test(path)) return "segment";
  if (path === "/get-quote") return "calculator";
  if (path === "/about") return "about";
  if (path === "/contact") return "contact";
  if (path === "/privacy" || path === "/terms" || path === "/cookies") return "legal";
  return "other";
}

/** GA4 wants "site_visit"; the popup's own intent is spelled "site-visit". */
export function intentParam(intent: "quote" | "site-visit"): QuoteIntentParam {
  return intent === "site-visit" ? "site_visit" : "quote";
}
