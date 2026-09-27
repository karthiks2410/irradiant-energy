/**
 * Recovery for a deploy that lands while a form is open.
 *
 * Every build gives its Server Actions new IDs. A page opened before a deploy still posts to the
 * old ID, the new server has no such action, and Next throws "Failed to find Server Action" in the
 * browser. Uncaught, that replaced the whole site with the global error screen — seen live on
 * 2026-09-26, when the owner pressed "See my estimate" minutes after a deploy. Vercel's Skew
 * Protection would route the old page to its own deployment, but it needs a Pro plan (this is Hobby).
 *
 * So the forms catch it, as the Next guide advises ("surface the error as a retry path in the UI
 * rather than a hard failure", node_modules/next/dist/docs/01-app/02-guides/server-actions.md):
 * the quick-quote form keeps what the visitor typed, reloads onto the new build and comes back
 * filled in where it was sent from. That is one of two surfaces (QuickQuote.tsx): the popup, which
 * reopens itself, or the form on the home page, which is refilled in place and scrolled back into
 * view. The record names its surface, so a home-page enquiry never comes back as a popup.
 *
 * The consent tick is NOT carried over: consent boxes are never pre-ticked (CheckboxField, DPDP), so
 * the visitor ticks it again and the notice says so.
 *
 * sessionStorage, not localStorage: it stays in this tab, and the record is removed the moment it
 * is read, so a name and phone number never outlive the reload that needed them.
 *
 * The lead source (src/lib/leads/first-touch.ts) is not saved here, because the reload keeps it:
 * `location.reload()` keeps the address, so the campaign tags in it are still there at the second
 * submit, and a first touch remembered with consent is in its own sessionStorage entry. The intent
 * (quote or site visit) is saved, and the reopened form posts it again.
 */

import { SEGMENTS, type Segment } from "@/lib/solar/constants";

const KEY = "ie:quick-quote-resume";
/** Long enough for a slow reload on a phone; short enough that a stale record never surprises anyone. */
const MAX_AGE_MS = 10 * 60 * 1000;

export type ResumeIntent = "quote" | "site-visit";

/** Where the quick-quote form was sent from: the popup, or the form on the home page. */
export const QUICK_QUOTE_SURFACES = ["popup", "home"] as const;
export type QuickQuoteSurface = (typeof QUICK_QUOTE_SURFACES)[number];

export interface QuickQuoteResume {
  /** The page it was filled in on; it reopens only there. */
  path: string;
  /** Which form it was filled in; only that form takes it back. */
  surface: QuickQuoteSurface;
  intent: ResumeIntent;
  segment: Segment;
  name: string;
  phone: string;
  pincode: string;
  billBucket: string;
  /** The original opening time, so the bot check does not see a two-second resubmit as a bot. */
  startedAt: number;
  savedAt: number;
}

/** True when the browser is online and the record was stored, i.e. a reload can recover. */
export function saveQuickQuoteResume(record: Omit<QuickQuoteResume, "savedAt">): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...record, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

/**
 * What this page load took, kept for the life of the page. React runs a mount effect twice in
 * development (StrictMode), and a remount could do the same: the second run must get the same
 * record back, not the empty storage the first run left, or the popup reopens and shuts again.
 * It is also what lets the two surfaces share one record on the home page: whichever mounts first
 * reads and removes it, and the other still gets the answer from here.
 */
let taken: { path: string; record: QuickQuoteResume | null } | undefined;

/**
 * Reads and removes the record; null unless it was saved on this page in the last ten minutes by
 * this surface. The record is removed whichever surface asks, so it is still used at most once.
 */
export function takeQuickQuoteResume(path: string, surface: QuickQuoteSurface): QuickQuoteResume | null {
  if (!taken) taken = { path, record: readOnce(path) };
  if (taken.path !== path) return null;
  return taken.record?.surface === surface ? taken.record : null;
}

/**
 * The recovered enquiry has gone through: a later mount in this page load starts empty. The popup
 * never needs this (it keeps its own one-shot flag); the home page form does, because leaving the
 * home page and coming back remounts it, and it would otherwise be refilled with an enquiry that
 * was already sent, inviting a second one.
 */
export function forgetQuickQuoteResume(surface: QuickQuoteSurface): void {
  if (taken?.record?.surface === surface) taken = { path: taken.path, record: null };
}

function readOnce(path: string): QuickQuoteResume | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const r = JSON.parse(raw) as Partial<QuickQuoteResume>;
    // A record saved by the build before the home-page form existed has no surface: it was the popup's.
    r.surface ??= "popup";
    const fresh = typeof r.savedAt === "number" && Date.now() - r.savedAt < MAX_AGE_MS;
    const valid =
      r.path === path &&
      QUICK_QUOTE_SURFACES.includes(r.surface) &&
      (r.intent === "quote" || r.intent === "site-visit") &&
      SEGMENTS.includes(r.segment as Segment) &&
      [r.name, r.phone, r.pincode, r.billBucket].every((v) => typeof v === "string") &&
      typeof r.startedAt === "number";
    return fresh && valid ? (r as QuickQuoteResume) : null;
  } catch {
    return null;
  }
}
