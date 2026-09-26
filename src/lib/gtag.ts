/**
 * Google Analytics 4 in the browser: load, configure, count page views, and switch off again.
 *
 * Framework-free, like src/lib/consent.ts: the React binding is src/components/analytics/
 * GoogleAnalytics.tsx, which is the only caller and calls in here only after the visitor has
 * allowed analytics (or, for `disableAnalytics`, when they have not).
 *
 * What is configured, and why (the /cookies notice describes exactly this, so keep them in step):
 * - Consent Mode defaults deny every advertising purpose. Only `analytics_storage` is granted, and
 *   only because this code runs after the visitor said yes.
 * - `allow_google_signals: false` and `allow_ad_personalization_signals: false`: visits are not
 *   joined to Google accounts and nothing is used for advertising.
 * - IP addresses: GA4 has no IP-anonymisation switch because, per Google, it does not log or store
 *   them; `anonymize_ip` is a Universal Analytics setting and is a no-op here, so it is not set.
 * - The `_ga` cookies expire CONSENT_COOKIE_DAYS after the last visit (Google's default is two
 *   years), so they do not outlast the answer that allowed them by much.
 * - `send_page_view: false`: the first page view and every client-side navigation are sent by
 *   `trackPageView`, once each. The web stream's Enhanced measurement option "Page changes based on
 *   browser history events" must be OFF in the GA4 admin, or App Router navigations count twice.
 * - Page addresses and referrers go to Google without their query string, except campaign tags:
 *   legacy links still carry a name or a phone number in the query (see next.config.ts), and none
 *   of that may leave the site.
 *
 * Withdrawal: gtag.js cannot be unloaded, so `disableAnalytics` sets Google's documented kill switch
 * (`window['ga-disable-<ID>'] = true`), which stops every further hit, denies analytics storage,
 * and deletes the `_ga` cookies.
 */

import { CONSENT_COOKIE_DAYS } from "@/lib/consent";

export const GTAG_SCRIPT_ID = "ga-gtag";
export const GTAG_SRC = "https://www.googletagmanager.com/gtag/js";

/** Query parameters allowed to reach Google: campaign attribution and the audience segment. */
const FORWARDED_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "segment"];

const COOKIE_LIFETIME_SECONDS = CONSENT_COOKIE_DAYS * 24 * 60 * 60;

type Gtag = (...args: unknown[]) => void;

type GaWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
} & Record<`ga-disable-${string}`, boolean | undefined>;

/** The ID this page has configured, so a remount does not configure it twice. */
let configuredId: string | null = null;
/** True between `enableAnalytics` and `disableAnalytics`. */
let active = false;
/** The last page_view sent, which is also the next one's referrer. */
let lastPageLocation: string | null = null;

function gaWindow(): GaWindow | null {
  // `unknown` first: Window has no index signature for the `ga-disable-<ID>` switch.
  return typeof window === "undefined" ? null : (window as unknown as GaWindow);
}

/**
 * The address without anything that could identify a person: origin and path, plus only the
 * allow-listed query parameters. No fragment. Returns "" for something that is not a URL.
 */
export function sanitizeUrl(href: string, base?: string): string {
  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return "";
  }
  // In the order the link had them, so the address still reads like the one the visitor used.
  const kept = new URLSearchParams([...url.searchParams].filter(([name]) => FORWARDED_PARAMS.includes(name)));
  const query = kept.toString();
  return `${url.origin}${url.pathname}${query ? `?${query}` : ""}`;
}

/** Google's own snippet: the queue gtag.js drains when it arrives. It must push `arguments`. */
function ensureGtag(w: GaWindow): Gtag {
  w.dataLayer = w.dataLayer ?? [];
  if (!w.gtag) {
    const queue = w.dataLayer;
    w.gtag = function gtag() {
      // gtag.js reads Arguments objects from the queue; an array would be taken as a GTM message.
      // eslint-disable-next-line prefer-rest-params
      queue.push(arguments);
    };
  }
  return w.gtag;
}

function injectScript(w: GaWindow, measurementId: string): void {
  const doc = w.document;
  if (doc.getElementById(GTAG_SCRIPT_ID)) return;
  const script = doc.createElement("script");
  script.id = GTAG_SCRIPT_ID;
  script.async = true;
  script.src = `${GTAG_SRC}?id=${encodeURIComponent(measurementId)}`;
  doc.head.appendChild(script);
}

/** Whether analytics is currently switched on in this page. */
export function isAnalyticsActive(): boolean {
  return active;
}

/**
 * Switch measurement on. Call ONLY when the visitor has allowed analytics. Idempotent: the script
 * is injected and configured once per page load; a later call just lifts a withdrawal.
 */
export function enableAnalytics(measurementId: string): void {
  const w = gaWindow();
  if (!w) return;
  w[`ga-disable-${measurementId}`] = false;
  const gtag = ensureGtag(w);
  active = true;

  if (configuredId === measurementId) {
    gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  gtag("js", new Date());
  gtag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: COOKIE_LIFETIME_SECONDS,
    page_location: sanitizeUrl(w.location.href),
    page_referrer: w.document.referrer ? sanitizeUrl(w.document.referrer) : "",
  });
  configuredId = measurementId;
  injectScript(w, measurementId);
}

/**
 * Count a page view for `pathname`, once. Returns whether one was sent. Does nothing unless
 * `enableAnalytics` ran and was not withdrawn since.
 */
export function trackPageView(pathname: string): boolean {
  const w = gaWindow();
  if (!w?.gtag || !active || !configuredId) return false;
  const location = sanitizeUrl(`${pathname}${w.location.search}`, w.location.origin);
  // React may run an effect twice for the same address (a remount, Strict Mode); count it once.
  if (!location || location === lastPageLocation) return false;
  const referrer = lastPageLocation ?? (w.document.referrer ? sanitizeUrl(w.document.referrer) : "");
  lastPageLocation = location;
  const page = { page_location: location, page_referrer: referrer, page_title: w.document.title };
  // `set` first, so engagement events that follow report this page too, not the address gtag.js
  // read when it loaded.
  w.gtag("set", page);
  w.gtag("event", "page_view", page);
  return true;
}

/**
 * The analytics cookies to remove: `_ga`, `_ga_<container>` (GA4), plus `_gid` and `_gat*`, which
 * an older Universal Analytics tag on the previous site could have left behind.
 */
function analyticsCookieNames(cookieHeader: string): string[] {
  return cookieHeader
    .split(";")
    .map((part) => part.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat"));
}

/**
 * Every Domain attribute the cookie could have been set with. gtag.js writes to the widest domain
 * the browser accepts ("irradiantenergy.in" from www), and a cookie is deleted only by a write
 * with the same Domain and Path, so each candidate is tried, plus the host-only form.
 */
export function cookieDomains(hostname: string): (string | null)[] {
  const labels = hostname.split(".");
  const domains: (string | null)[] = [null];
  for (let i = 0; i < labels.length - 1; i += 1) domains.push(labels.slice(i).join("."));
  if (labels.length === 1) domains.push(hostname);
  return domains;
}

/** Delete the analytics cookies from this browser. Returns the names that were present. */
export function clearAnalyticsCookies(): string[] {
  const w = gaWindow();
  if (!w) return [];
  try {
    const names = analyticsCookieNames(w.document.cookie);
    for (const name of names) {
      for (const domain of cookieDomains(w.location.hostname)) {
        w.document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ""}`;
      }
    }
    return names;
  } catch {
    // Cookie access throws in some sandboxed contexts; then there is nothing we could have set.
    return [];
  }
}

/**
 * Switch measurement off, or make sure it is off: stop every further hit, deny analytics storage
 * and delete the cookies. Safe to call when analytics never ran.
 */
export function disableAnalytics(measurementId: string): void {
  const w = gaWindow();
  if (!w) return;
  w[`ga-disable-${measurementId}`] = true;
  if (active && w.gtag) w.gtag("consent", "update", { analytics_storage: "denied" });
  active = false;
  // A later re-grant counts the page it happens on.
  lastPageLocation = null;
  clearAnalyticsCookies();
}
