/**
 * Consent preference store — the only thing this site keeps on a visitor's device.
 *
 * Why it is built this way (docs/discovery/18-india-legal-cyber-compliance.md §9.3, §9.5;
 * 17-privacy-legal-compliance.md §2.6; decisions.md D-007 — India, not GDPR):
 *
 * - The old site's banner offered Google Analytics and Google Ads categories while no Google tag
 *   existed anywhere, and Vercel Analytics ran whatever the visitor chose (18 §9.6). A banner that
 *   describes tracking you do not do, or ignores a refusal, is worse than no banner. So this module
 *   models exactly one optional category — `analytics` — and nothing reads it except a gate that
 *   decides whether to render a provider that is **not installed yet**.
 * - `necessary` is not a choice, so it is not stored. It is always on and the UI says so.
 * - The record carries a `version`. Bumping CONSENT_VERSION invalidates every stored answer and
 *   re-asks, which is what has to happen when the categories or their purposes change. It is not a
 *   nag timer: an unchanged version is never re-asked before the cookie expires.
 *
 * Storage is a first-party cookie rather than localStorage so a future server-side gate (middleware
 * or a Server Component) can read the same answer without a client round-trip. It holds the answer,
 * the date and the version — no identifier, nothing that describes the person.
 *
 * Framework-free on purpose: no React import, so this file is safe in a Server Component, in a
 * client island, or in a test. The React binding lives in components/consent/useConsent.ts.
 */

/** Bump when the categories, their purposes or the providers behind them change. */
export const CONSENT_VERSION = 1;

/** First-party, readable by the server if a gate is ever moved there. */
export const CONSENT_COOKIE_NAME = "ie_consent";

/** 180 days, matching the notice on /cookies. After that we ask once more. */
export const CONSENT_COOKIE_DAYS = 180;

/** Fired on `window` to re-open the preferences dialog from anywhere (e.g. the footer link). */
export const CONSENT_SETTINGS_EVENT = "irradiant:consent-settings";

/** The categories the visitor decides. `necessary` is deliberately absent: it is not optional. */
export interface ConsentChoice {
  /**
   * Visit measurement. **Nothing is installed today** — no script of any kind is loaded — so this
   * currently gates an empty set. It exists so that the day a provider is added, it cannot ship
   * without a prior opt-in (18 §9.5.9).
   */
  analytics: boolean;
}

export type OptionalCategory = keyof ConsentChoice;
export type ConsentCategory = "necessary" | OptionalCategory;

export const OPTIONAL_CATEGORIES: readonly OptionalCategory[] = ["analytics"];

/** Optional categories are off until the visitor turns them on (DPDP s.6: no pre-ticked consent). */
export const DEFAULT_CHOICE: ConsentChoice = { analytics: false };
export const ACCEPT_ALL: ConsentChoice = { analytics: true };
export const REJECT_ALL: ConsentChoice = { analytics: false };

export interface ConsentRecord extends ConsentChoice {
  /** CONSENT_VERSION at the time of the answer. A mismatch means "ask again". */
  version: number;
  /** ISO 8601 (UTC) timestamp of the answer. */
  decidedAt: string;
}

const COOKIE_MAX_AGE_SECONDS = CONSENT_COOKIE_DAYS * 24 * 60 * 60;

/* ------------------------------------------------------------------ storage */

function readRawCookie(): string {
  if (typeof document === "undefined") return "";
  try {
    const prefix = `${CONSENT_COOKIE_NAME}=`;
    const entry = document.cookie.split(";").find((part) => part.trimStart().startsWith(prefix));
    return entry ? entry.trimStart().slice(prefix.length) : "";
  } catch {
    // Cookie access throws in some sandboxed contexts. Treat it as "no answer stored".
    return "";
  }
}

function parseRecord(raw: string): ConsentRecord | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof data !== "object" || data === null) return null;
    const { version, analytics, decidedAt } = data as Record<string, unknown>;
    // A stale version is not "no consent" and not "consent" — it is a question to ask again.
    if (version !== CONSENT_VERSION) return null;
    if (typeof analytics !== "boolean" || typeof decidedAt !== "string") return null;
    return { version: CONSENT_VERSION, analytics, decidedAt };
  } catch {
    return null;
  }
}

function writeCookie(record: ConsentRecord): void {
  if (typeof document === "undefined") return;
  try {
    // Secure only where it is valid, so the cookie also works on http://localhost during review.
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const value = encodeURIComponent(JSON.stringify(record));
    document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  } catch {
    // Storage blocked. `sessionRecord` below still honours the answer for this page session, so the
    // visitor is not asked again while they read; it is simply not remembered for the next visit.
  }
}

/* ----------------------------------------------------------- reactive store */

const listeners = new Set<() => void>();

/**
 * useSyncExternalStore requires a snapshot that is referentially stable between changes, so the
 * parsed record is cached against the raw cookie string it came from and only re-parsed when that
 * string actually differs (another tab, devtools, expiry).
 */
let cachedRaw: string | null = null;
let cachedRecord: ConsentRecord | null = null;
let sessionRecord: ConsentRecord | null = null;

function notify(): void {
  for (const listener of listeners) listener();
}

/** Subscribe to consent changes. Returns the unsubscribe function. */
export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The stored answer, or null when the visitor has not answered the current version. */
export function getConsentSnapshot(): ConsentRecord | null {
  const raw = readRawCookie();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedRecord = parseRecord(raw);
  }
  return cachedRecord ?? sessionRecord;
}

/**
 * Always null on the server: the answer is never read during render, so pages stay static and the
 * banner cannot cause a hydration mismatch. The client fills it in after mount.
 */
export function getServerConsentSnapshot(): ConsentRecord | null {
  return null;
}

/** Record an answer. Safe to call from an event handler in a client component. */
export function saveConsent(choice: ConsentChoice): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    analytics: choice.analytics,
    decidedAt: new Date().toISOString(),
  };
  writeCookie(record);
  sessionRecord = record;
  cachedRaw = null; // force a re-read on the next snapshot
  notify();
  return record;
}

/**
 * Forget the answer and ask again. This is the withdrawal path of last resort; the normal way to
 * change your mind is to re-open the preferences dialog and save a different answer.
 */
export function clearConsent(): void {
  if (typeof document !== "undefined") {
    try {
      document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    } catch {
      /* nothing to clear */
    }
  }
  sessionRecord = null;
  cachedRaw = null;
  cachedRecord = null;
  notify();
}

/**
 * The gate. `necessary` is always true; every optional category is false until it is granted, which
 * includes the case where the visitor has not answered yet.
 *
 * Read it from an event handler or an effect. In render, prefer the `useConsentGranted` hook (or
 * `<ConsentGate>`), which subscribes to changes instead of reading once.
 */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  return getConsentSnapshot()?.[category] === true;
}

/** Open the preferences dialog from anywhere (footer link, /cookies page, a support reply). */
export function openConsentSettings(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_SETTINGS_EVENT));
}
