/**
 * The browser half of the lead source (src/lib/leads/source.ts): remember how this visit began, and
 * put the lead source on a form as it is sent.
 *
 * First touch — the first page of the visit, its campaign tags and the website that sent the
 * visitor — is kept only with analytics consent, and only in a build that runs analytics
 * (`analyticsEnabled`), because the privacy notice describes it under analytics. It lives in
 * sessionStorage: this tab only, gone when the tab closes, never sent anywhere except inside an
 * enquiry the visitor chooses to send. Withdrawing consent removes it (<LeadSourceCapture>).
 *
 * The landing page is read when this module first runs, which is when the page the visitor opened
 * hydrates — so a visitor who answers the banner on the page they landed on, or later on another
 * page in the same tab, is credited to where they actually arrived. That snapshot is held in memory
 * only; nothing is written before consent.
 *
 * Without consent, an enquiry carries only the page it was sent from and the utm_* tags in the
 * address at that moment.
 *
 * Every read and write is wrapped: storage can be blocked, full or throw in a private window, and
 * none of that may stop an enquiry.
 */

import { analyticsEnabled } from "@/lib/analytics";
import { hasConsent } from "@/lib/consent";
import { cleanLeadSource, LEAD_SOURCE_FIELD, utmFromSearch, UTM_KEYS, type LeadSource } from "./source";

const KEY = "ie:first-touch";

/** The keys first touch may hold; `page` is added at the moment of sending. */
const FIRST_TOUCH_KEYS = ["landing", "referrer", ...UTM_KEYS] as const;

/** How this document was opened. Memory only; written to storage only with consent. */
const opened =
  typeof window === "undefined"
    ? null
    : { path: window.location.pathname, search: window.location.search, referrer: document.referrer, host: window.location.host };

/** The referring site's host, or undefined for none or for this site itself (a reload, a language switch). */
export function referrerHost(referrer: string, ownHost: string): string | undefined {
  if (!referrer) return undefined;
  try {
    const url = new URL(referrer);
    if (url.host === ownHost) return undefined;
    return url.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/** First touch as this document saw it. */
function openedFirstTouch(): LeadSource {
  if (!opened) return {};
  return cleanLeadSource({
    ...utmFromSearch(opened.search),
    landing: opened.path,
    referrer: referrerHost(opened.referrer, opened.host),
  });
}

function onlyFirstTouchKeys(source: LeadSource): LeadSource {
  const out: LeadSource = {};
  for (const key of FIRST_TOUCH_KEYS) if (source[key]) out[key] = source[key];
  return out;
}

function readStored(): LeadSource | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null) return null;
    return onlyFirstTouchKeys(cleanLeadSource(data as Record<string, unknown>));
  } catch {
    return null;
  }
}

function mayRemember(): boolean {
  return analyticsEnabled && hasConsent("analytics");
}

/**
 * Remember how this visit began, once per tab. Does nothing without analytics consent or when it
 * is already remembered. Returns whether a first touch is stored now.
 */
export function captureFirstTouch(): boolean {
  if (typeof window === "undefined" || !mayRemember()) return false;
  if (readStored()) return true;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(openedFirstTouch()));
    return true;
  } catch {
    return false;
  }
}

/** Forget it: analytics consent was refused or withdrawn. */
export function clearFirstTouch(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing stored */
  }
}

/** The lead source for an enquiry sent now, as the JSON the form field carries. */
export function leadSourceNow(): LeadSource {
  if (typeof window === "undefined") return {};
  const page = window.location.pathname;
  if (mayRemember()) {
    captureFirstTouch();
    // Storage refused: this document's own first touch is still known, in memory.
    return cleanLeadSource({ ...(readStored() ?? openedFirstTouch()), page });
  }
  return cleanLeadSource({ ...utmFromSearch(window.location.search), page });
}

/**
 * Put the lead source on a form's data just before it is posted: the hidden `leadSource` field.
 * Called from each form's action wrapper, so it reflects the moment of sending, not of rendering.
 */
export function withLeadSource(data: FormData): FormData {
  try {
    data.set(LEAD_SOURCE_FIELD, JSON.stringify(leadSourceNow()));
  } catch {
    // Never let the source cost the enquiry: send it without one.
  }
  return data;
}
