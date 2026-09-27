"use client";

/**
 * The one-tap quote popup: a header button on every page opens a short form (name, WhatsApp number,
 * PIN, bill range, one consent tick), and submitting it shows the estimate straight away.
 *
 * The same form, always open, is also on the home page (owner decision, 2026-09-27: "same system,
 * two places they can't miss"). The home page used to hand out the whole estimate from a calculator
 * band before anyone left a number, so a visitor who never pressed the popup button was never
 * asked. `<QuickQuoteInline>` renders the very same form and result — same fields, validation,
 * Server Actions, copy and email step — as a section rather than a dialog: no scroll lock, nothing
 * to close. The two are one implementation with a `surface` ("popup" | "home"), which only changes
 * element ids, the padding, analytics' `form` name and the form named in the sales alert and the
 * lead register. /get-quote keeps its full, ungated calculator.
 *
 * Why it exists (owner, 2026-09-25): the market leader converts through a form that is always one
 * tap away, not by hiding its calculator — theirs is open, and so is ours. This adds the tap-away
 * form without taking anything off /get-quote, which keeps the full breakdown.
 *
 * Shape:
 * - `openQuickQuote()` fires a window event; `<QuickQuoteButton>` calls it. Any button anywhere —
 *   the header, the mobile menu, a solutions page — can open the one dialog mounted in the layout,
 *   without prop-drilling or a context provider around the whole site.
 * - The dialog is the native <dialog> with showModal(), like the mobile menu and the cookie
 *   settings: focus containment, Escape and the inert page come from the platform. While it is
 *   open, `data-scroll-locked` on <html> stops Lenis, the same switch the consent banner uses.
 * - The form only asks for what the estimate and the follow-up need. The property type is read
 *   from the page (the businesses page opens on "Business") and can be changed.
 * - Figures are ranges, because the bill is a range (src/lib/leads/quick.ts).
 * - Email is asked for only after the figures are on screen, as one optional field.
 * - Analytics (only with consent, src/lib/gtag.ts `track`): open_quote with the intent and which
 *   button opened it, generate_lead when an enquiry goes through and email_estimate when the
 *   breakdown is emailed — the property type, the bill RANGE id and the page language, never a
 *   name, number, PIN or address. The lead source rides along with each enquiry for the sales
 *   alert only (src/lib/leads/first-touch.ts), and the intent travels as a hidden field so the
 *   alert and the lead register can tell a site-visit request from a quote.
 *
 * Consent is one unticked box that names both channels the visitor's number will be used on, for
 * this enquiry only (DPDP: free, specific, informed, unambiguous, an affirmative act). Closing the
 * dialog is as easy as submitting it: a plain close button, no "no thanks" link, no urgency.
 *
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: the popup's words (src/content/ui.ts `quickQuote`,
 * overlaid in Kannada) and the society and business bill ranges in src/lib/leads/quick.ts.
 */

import { usePathname } from "next/navigation";
import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { Link, useLocale } from "@/components/i18n/LocaleLink";
import type { QuotePage } from "@/content/quote";
import type { Ui } from "@/content/ui";
import { fill } from "@/i18n/format";
import { LEAD_ERROR_PARAMS, type LeadFieldErrorCode } from "@/lib/leads/errors";
import { emailQuickQuote, submitQuickQuote } from "@/lib/leads/submit-lead";
import { Button, CheckboxField, controlClass, FieldError, TextField } from "@/components/ui";
import { ChoiceChips } from "@/components/ui/fields/ChoiceChips";
import { BILL_BUCKETS, bucketForBill, bucketLabel } from "@/lib/leads/quick";
import { checkEmail, checkName, checkPhone, checkPincode } from "@/lib/leads/rules";
import type { QuickLeadField } from "@/lib/leads/schema";
import { initialQuickEmailState, initialQuickQuoteState, type QuickEmailState, type QuickQuoteState } from "@/lib/leads/state";
import {
  forgetQuickQuoteResume,
  saveQuickQuoteResume,
  takeQuickQuoteResume,
  type QuickQuoteResume,
  type QuickQuoteSurface,
} from "./stale-resume";
import { SEGMENTS, type Segment } from "@/lib/solar/constants";
import { intentParam, languageOf, type QuotePlacement } from "@/lib/events";
import { track } from "@/lib/gtag";
import { withLeadSource } from "@/lib/leads/first-touch";

export type QuickQuoteIntent = "quote" | "site-visit";

const OPEN_EVENT = "irradiant:quick-quote";

interface OpenDetail {
  intent: QuickQuoteIntent;
  /** Which button asked, for analytics; null for the reopening after a recovery reload. */
  placement: QuotePlacement | null;
}

/** Opens the popup from anywhere on the page. `placement` says which button asked (analytics). */
export function openQuickQuote(intent: QuickQuoteIntent = "quote", placement: QuotePlacement | null = "other") {
  window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail: { intent, placement } }));
}

/**
 * Every word the popup prints, handed down from the layout in the page's language. This is a
 * client island, so it may not import a content module (scripts/check-client-content.ts): that
 * would ship both languages' copy to the browser.
 */
export type QuickQuoteCopy = Ui["quickQuote"] & {
  fieldErrors: QuotePage["form"]["fieldErrors"];
  formErrors: QuotePage["form"]["formErrors"];
  /** Full property names, for the sentence under the result ("For a home with a bill of…"). */
  segmentNames: Readonly<Record<Segment, string>>;
};

const CopyContext = createContext<QuickQuoteCopy | null>(null);

function useCopy(): QuickQuoteCopy {
  const copy = useContext(CopyContext);
  if (!copy) throw new Error("QuickQuote copy is missing: mount <QuickQuoteDialog copy={…}> or <QuickQuoteInline copy={…}>.");
  return copy;
}

/**
 * What differs between the two surfaces, and nothing else. Ids differ because both forms are in the
 * home page's DOM at once (the popup is mounted, closed, in the layout): two `id="qq-name"` would
 * send a label's click, or a `getElementById`, to the other form.
 */
const SURFACE = {
  popup: { ids: "qq", padding: "px-5 pt-4 pb-5" },
  home: { ids: "hq", padding: "px-4 py-5 sm:p-6 lg:p-7" },
} as const satisfies Record<QuickQuoteSurface, { ids: string; padding: string }>;

const intentCopy = (c: QuickQuoteCopy, intent: QuickQuoteIntent) => (intent === "site-visit" ? c.siteVisit : c.quote);

/** A field error code in the page's language, with its limits filled in ("under 80 characters"). */
const message = (c: QuickQuoteCopy, code: LeadFieldErrorCode) => fill(c.fieldErrors[code], LEAD_ERROR_PARAMS[code] ?? {});

/** The page decides the starting property type; everywhere else starts on "Home". */
function segmentFromPath(pathname: string): Segment {
  const match = pathname.match(/\/solutions\/solar\/(home|housing-society|commercial)(?:\/|$)/);
  return (match?.[1] as Segment | undefined) ?? "home";
}


export function QuickQuoteButton({
  intent = "quote",
  placement = "other",
  variant = "primary",
  className,
  children,
}: {
  intent?: QuickQuoteIntent;
  /** Where the button sits, reported with open_quote: header, hero, segment, closing, menu, other. */
  placement?: QuotePlacement;
  variant?: "primary" | "light" | "outline" | "outline-light";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button variant={variant} arrow className={className} aria-haspopup="dialog" onClick={() => openQuickQuote(intent, placement)}>
      {children}
    </Button>
  );
}

/** Mounted once, in the root layout. */
export function QuickQuoteDialog({ copy: c }: { copy: QuickQuoteCopy }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [intent, setIntent] = useState<QuickQuoteIntent>("quote");
  const [segment, setSegment] = useState<Segment>("home");
  const [startedAt, setStartedAt] = useState(0);
  // A finished enquiry starts fresh next time; a half-filled one is kept if the dialog was closed.
  const [session, setSession] = useState(0);
  const finished = useRef(false);
  /** Set when this page load is the reload after a deploy caught a submit (stale-resume.ts). */
  const [resume, setResume] = useState<QuickQuoteResume | null>(null);
  const pendingResume = useRef<QuickQuoteResume | null>(null);

  const close = useCallback(() => dialogRef.current?.close(), []);

  const show = useCallback(() => {
    document.documentElement.setAttribute("data-scroll-locked", "");
    dialogRef.current?.showModal();
  }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      // A recovered enquiry is used once, by this opening; the next one is a normal one.
      const recovered = pendingResume.current;
      pendingResume.current = null;
      if (finished.current || recovered || resume) {
        setSession((n) => n + 1);
        finished.current = false;
      }
      const detail = (event as CustomEvent<OpenDetail | undefined>).detail;
      const nextIntent = recovered?.intent ?? detail?.intent ?? "quote";
      setResume(recovered);
      setIntent(nextIntent);
      setSegment(recovered?.segment ?? segmentFromPath(window.location.pathname));
      setStartedAt(recovered?.startedAt ?? Date.now());
      show();
      // A visitor's own opening only: the reopening after a recovery reload was counted before it.
      if (!recovered && detail?.placement) {
        track("open_quote", {
          intent: intentParam(nextIntent),
          button: detail.placement,
          site_language: languageOf(window.location.pathname),
        });
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [show, resume]);

  // Leaving the page closes it, like the mobile menu.
  useEffect(() => {
    close();
  }, [pathname, close]);

  // After the recovery reload: reopen, through the normal opening path, with what was typed.
  // Declared after the effect above on purpose: effects run in order, and that one closes the
  // dialog on mount, so running first it would shut the popup this one has just reopened.
  useEffect(() => {
    const saved = takeQuickQuoteResume(window.location.pathname, "popup");
    if (!saved) return;
    pendingResume.current = saved;
    openQuickQuote(saved.intent, null);
  }, []);

  const copy = intentCopy(c, intent);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => document.documentElement.removeAttribute("data-scroll-locked")}
      aria-labelledby="quick-quote-title"
      data-track-location="popup"
      data-lenis-prevent
      className="sheet m-auto max-h-[calc(100dvh-2rem)] w-[min(38rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-lg bg-white p-0 text-carbon shadow-overlay max-sm:mb-0 max-sm:max-h-[calc(100dvh-0.5rem)] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
    >
      <div className="flex items-start justify-between gap-4 border-b border-mist px-5 py-4">
        <div>
          <h2 id="quick-quote-title" className="font-display text-h4 font-bold text-carbon">
            {copy.title}
          </h2>
          <p className="mt-0.5 text-small text-ink-2">{copy.lead}</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="-mr-1 inline-grid size-10 shrink-0 place-items-center rounded-full border border-mist text-teal-900 transition-colors hover:bg-canvas"
        >
          <span className="sr-only">{c.close}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <CopyContext.Provider value={c}>
      <QuickQuoteBody
        key={session}
        surface="popup"
        resume={resume}
        intent={intent}
        segment={segment}
        onSegmentChange={setSegment}
        startedAt={startedAt}
        onFinished={() => {
          finished.current = true;
        }}
      />
      </CopyContext.Provider>
    </dialog>
  );
}

/** The home page's hero asks the form to take a bill: `request` goes up by one each time. */
export interface QuickQuoteHandoff {
  /** The bill typed in the hero, or null when it is empty or not a number. */
  bill: number | null;
  request: number;
}

/** What the form is asked to take: the range to pre-select, and the ask it answers. */
interface QuickQuotePreset {
  billBucket: string | null;
  request: number;
}

const subscribeNothing = () => () => {};

/**
 * A deploy-recovery record for the home page form, read once per page load (stale-resume.ts). An
 * external store rather than an effect: it is sessionStorage, which the server cannot see, so the
 * server snapshot is "nothing" and React swaps in the record straight after hydration.
 */
const homeResume = () => takeQuickQuoteResume(window.location.pathname, "home");
const noResume = () => null;
/** Sent: coming back to the home page later in this page load shows an empty form. */
const forgetHomeResume = () => forgetQuickQuoteResume("home");
/** The scroll back to the form happens once per page load, not on every return to the home page. */
let scrolledBack = false;

/**
 * When the form was on offer from, for the bot check (a submit within three seconds is refused):
 * the start of this page load. The server renders 0, which the check reads as long ago.
 */
const pageStart = () => Math.round(performance.timeOrigin);
const noPageStart = () => 0;

/**
 * The quick-quote form as a section of a page: the home page's quote band (components/home/
 * HomeQuote.tsx). It is the popup's body — the same form, result, email step and Server Actions —
 * without the dialog around it.
 *
 * - It is always open, so no open_quote is counted; generate_lead reports `form: "home"`.
 * - The hero's bill (`handoff`) pre-selects the range it falls in for the property type chosen
 *   here, then the cursor goes to Name.
 * - After a deploy caught a submit, the reload refills it here, not in the popup, and scrolls back.
 */
export function QuickQuoteInline({
  copy: c,
  handoff,
  className = "",
}: {
  copy: QuickQuoteCopy;
  handoff?: QuickQuoteHandoff;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [segment, setSegment] = useState<Segment>("home");
  const recovered = useSyncExternalStore(subscribeNothing, homeResume, noResume);
  const loadedAt = useSyncExternalStore(subscribeNothing, pageStart, noPageStart);

  // A recovered enquiry is kept for the life of this form, with its property type (adjusted during
  // render, not in an effect). Kept in state rather than read from the store each render, so that
  // forgetting it once sent cannot swap the result on screen for an empty form.
  const [resume, setResume] = useState<QuickQuoteResume | null>(null);
  if (recovered && !resume) {
    setResume(recovered);
    setSegment(recovered.segment);
  }

  // Back to where the visitor was. The page reloaded at the top or wherever the browser restored it.
  useEffect(() => {
    if (!resume || scrolledBack) return;
    scrolledBack = true;
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [resume]);

  const preset: QuickQuotePreset | null = handoff
    ? { billBucket: bucketForBill(segment, handoff.bill)?.id ?? null, request: handoff.request }
    : null;

  return (
    <div ref={rootRef} className={className}>
      <CopyContext.Provider value={c}>
        <QuickQuoteBody
          // The recovered fields are the body's starting state, so it starts again once they arrive.
          key={resume ? "resumed" : "fresh"}
          surface="home"
          resume={resume}
          intent="quote"
          segment={segment}
          onSegmentChange={setSegment}
          startedAt={resume?.startedAt ?? loadedAt}
          onFinished={forgetHomeResume}
          preset={preset}
        />
      </CopyContext.Provider>
    </div>
  );
}

function QuickQuoteBody({
  surface,
  resume,
  intent,
  segment,
  onSegmentChange,
  startedAt,
  onFinished,
  preset = null,
}: {
  surface: QuickQuoteSurface;
  resume: QuickQuoteResume | null;
  intent: QuickQuoteIntent;
  segment: Segment;
  onSegmentChange: (segment: Segment) => void;
  startedAt: number;
  onFinished: () => void;
  /** Home page only: a range to pre-select, asked for by the hero. */
  preset?: QuickQuotePreset | null;
}) {
  const c = useCopy();
  const locale = useLocale();
  const { ids, padding } = SURFACE[surface];
  const [state, formAction] = useActionState(
    async (previous: QuickQuoteState, data: FormData): Promise<QuickQuoteState> => {
      try {
        return await submitQuickQuote(previous, withLeadSource(data));
      } catch {
        // The action could not be reached: almost always a deploy since this page loaded
        // (stale-resume.ts). Keep what was typed, reload onto the new build, reopen filled in.
        const text = (key: string) => String(data.get(key) ?? "");
        const saved = saveQuickQuoteResume({
          path: window.location.pathname,
          surface,
          intent,
          segment,
          name: text("name"),
          phone: text("phone"),
          pincode: text("pincode"),
          billBucket: text("billBucket"),
          startedAt,
        });
        if (saved) window.location.reload();
        // Offline, or storage refused: say so plainly and offer WhatsApp and the phone instead.
        return { ok: false, errorCode: saved ? "stale" : "send" };
      }
    },
    initialQuickQuoteState,
  );
  const [bucket, setBucket] = useState(resume?.billBucket ?? "");
  const [name, setName] = useState(resume?.name ?? "");
  const [pincode, setPincode] = useState(resume?.pincode ?? "");
  const [errors, setErrors] = useState<Partial<Record<QuickLeadField, LeadFieldErrorCode>>>({});
  const errorSummaryRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // The hero's bill, taken as the range it falls in. Only a new ask changes the choice, so picking
  // another range here afterwards sticks; a bill with no range (empty) leaves the choice alone.
  const presetRequest = preset?.request ?? 0;
  const [presetSeen, setPresetSeen] = useState(presetRequest);
  if (preset && presetRequest !== presetSeen) {
    setPresetSeen(presetRequest);
    if (preset.billBucket) {
      setBucket(preset.billBucket);
      setErrors((prev) => ({ ...prev, billBucket: undefined }));
    }
  }
  // …and the cursor goes to the first field. preventScroll: the hero's jump to the section owns the
  // scroll. Nothing happens on mount, only on a new ask.
  useEffect(() => {
    if (presetRequest > 0) nameRef.current?.focus({ preventScroll: true });
  }, [presetRequest]);

  // A new result from the server replaces the field errors. Adjusting during render rather than in
  // an effect avoids a second render pass (react.dev "you might not need an effect").
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok === false && state.fieldErrors) setErrors(state.fieldErrors);
  }

  // Side effects only: tell the dialog this enquiry is done and count it once (a remount or Strict
  // Mode can run this twice for the same result, and a new `onFinished` from a parent re-render runs
  // it again).
  const counted = useRef<string | null>(null);
  useEffect(() => {
    if (state.ok !== true) return;
    onFinished();
    if (counted.current === state.reference) return;
    counted.current = state.reference;
    track("generate_lead", {
      form: surface === "home" ? "home" : intent === "site-visit" ? "site_visit" : "popup",
      property_type: segment,
      bill_band: bucket || "unknown",
      site_language: locale,
    });
  }, [state, onFinished, surface, intent, segment, bucket, locale]);

  // Move focus to a failure message: once per answer from the server, never on a later re-render
  // (a new property type, the hero's hand-off), which would pull the cursor out of a field.
  useEffect(() => {
    if (state.ok === false) errorSummaryRef.current?.focus();
  }, [state]);

  // The bill ranges belong to the property type, so changing one clears the other.
  const buckets = BILL_BUCKETS[segment];
  const bucketOptions = buckets.map((b, i) => ({ value: b.id, label: bucketLabel(b, i === 0, c.ranges) }));
  const segmentOptions = SEGMENTS.map((value) => ({ value, label: c.segmentShort[value] }));

  const validate = (form: HTMLFormElement): Partial<Record<QuickLeadField, LeadFieldErrorCode>> => {
    const data = new FormData(form);
    const text = (key: string) => String(data.get(key) ?? "");
    const found: Partial<Record<QuickLeadField, LeadFieldErrorCode>> = {};
    const nameError = checkName(text("name"));
    if (nameError) found.name = nameError;
    const phoneError = checkPhone(text("phone"));
    if (phoneError) found.phone = phoneError;
    const pinError = checkPincode(text("pincode"));
    if (pinError) found.pincode = pinError;
    if (!data.get("billBucket")) found.billBucket = "billBucket.required";
    if (!data.get("consent")) found.consent = "consent.required";
    return found;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const found = validate(event.currentTarget);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      event.preventDefault();
      // Send focus to the first field that needs attention.
      const first = QUICK_ORDER.find((field) => found[field]);
      if (first) event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    }
  };

  /**
   * Errors appear on submit and clear while the visitor types the fix — never on blur. Clearing on
   * blur removed the error line at the moment a finger landed on the next control, so everything
   * below jumped up and the tap hit empty space: fixing the PIN and then tapping a bill range
   * silently selected nothing (found in testing, 2026-09-25). Nothing moves under a pointer now.
   */
  const recheck = (field: "name" | "phone" | "pincode", value: string) => {
    if (!errors[field]) return;
    const check = field === "name" ? checkName : field === "phone" ? checkPhone : checkPincode;
    if (!check(value)) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (state.ok === true) {
    return (
      <QuickQuoteResult
        surface={surface}
        state={state}
        segment={segment}
        name={name}
        pincode={pincode}
        billBucket={bucket}
      />
    );
  }

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className={`grid gap-4 ${padding}`}>
      {resume && state.ok === null && (
        <p role="status" className="rounded-md bg-soft-green p-4 text-small text-carbon">
          {c.resumed}
        </p>
      )}
      {state.ok === false && (
        <p ref={errorSummaryRef} tabIndex={-1} role="alert" className="rounded-md bg-error-tint p-4 text-small text-carbon">
          {c.formErrors[state.errorCode]}{" "}
          {state.whatsappHref && (
            <a href={state.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-700 underline underline-offset-2">
              {c.failedWhatsapp}
            </a>
          )}
        </p>
      )}

      <input type="hidden" name="startedAt" value={String(startedAt)} />
      <input type="hidden" name="locale" value={locale} />
      {/* Quote or site visit, and popup or home page, for the sales alert and the lead register. */}
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="surface" value={surface} />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor={`${ids}-website`}>Website</label>
        <input id={`${ids}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        ref={nameRef}
        id={`${ids}-name`}
        name="name"
        label={c.nameLabel}
        autoComplete="name"
        required
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          recheck("name", event.target.value);
        }}
        error={errors.name && message(c, errors.name)}
      />
      <TextField
        id={`${ids}-phone`}
        name="phone"
        type="tel"
        label={c.phone}
        prefix="+91"
        inputMode="tel"
        autoComplete="tel-national"
        required
        defaultValue={resume?.phone}
        onChange={(event) => recheck("phone", event.target.value)}
        error={errors.phone && message(c, errors.phone)}
      />
      </div>

      <div className="grid gap-4 sm:grid-cols-[9rem_1fr] sm:items-start">
      <TextField
        id={`${ids}-pincode`}
        name="pincode"
        label={c.pincode}
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={6}
        required
        value={pincode}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
          setPincode(digits);
          recheck("pincode", digits);
        }}
        error={errors.pincode && message(c, errors.pincode)}
      />

      <ChoiceChips
        name="segment"
        idPrefix={`${ids}-segment`}
        legend={c.segment}
        size="sm"
        options={segmentOptions}
        value={segment}
        onChange={(event) => {
          onSegmentChange(event.target.value as Segment);
          setBucket("");
        }}
      />
      </div>
      <ChoiceChips
        name="billBucket"
        idPrefix={`${ids}-billBucket`}
        legend={c.bill}
        size="sm"
        options={bucketOptions}
        value={bucket}
        onChange={(event) => {
          setBucket(event.target.value);
          setErrors((prev) => ({ ...prev, billBucket: undefined }));
        }}
        required
        error={errors.billBucket && message(c, errors.billBucket)}
      />

      <CheckboxField
        id={`${ids}-consent`}
        name="consent"
        required
        error={errors.consent && message(c, errors.consent)}
        onChange={(event) => event.target.checked && setErrors((prev) => ({ ...prev, consent: undefined }))}
        label={
          <>
            {c.consent.split("{privacy}")[0]}
            <Link href="/privacy" className="font-medium text-green-700 underline underline-offset-2 hover:no-underline">
              {c.privacy}
            </Link>
            {c.consent.split("{privacy}")[1]}
          </>
        }
      />

      <SubmitButton label={intentCopy(c, intent).submit} />
    </form>
  );
}

const QUICK_ORDER: QuickLeadField[] = ["name", "phone", "pincode", "billBucket", "consent"];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const c = useCopy();
  return (
    <Button type="submit" arrow disabled={pending} className="w-full justify-between pl-6">
      {pending ? c.sending : label}
    </Button>
  );
}

function QuickQuoteResult({
  surface,
  state,
  segment,
  name,
  pincode,
  billBucket,
}: {
  surface: QuickQuoteSurface;
  state: Extract<Awaited<ReturnType<typeof submitQuickQuote>>, { ok: true }>;
  segment: Segment;
  name: string;
  pincode: string;
  billBucket: string;
}) {
  const c = useCopy();
  const locale = useLocale();
  const [emailState, emailAction] = useActionState(
    async (previous: QuickEmailState, data: FormData): Promise<QuickEmailState> => {
      try {
        return await emailQuickQuote(previous, data);
      } catch {
        // Unreachable action (a deploy since this page loaded, or offline). The estimate stays on
        // screen; the message asks for a refresh, and WhatsApp and the phone remain right here.
        return { ok: false, errorCode: navigator.onLine === false ? "send" : "stale" };
      }
    },
    initialQuickEmailState,
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<LeadFieldErrorCode | undefined>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statusId = useId();
  const { summary } = state;
  const { ids, padding } = SURFACE[surface];
  const emailId = `${ids}-email`;

  // Move focus to the result, so a screen-reader user hears what changed.
  useEffect(() => headingRef.current?.focus(), []);
  const [seenEmail, setSeenEmail] = useState(emailState);
  if (seenEmail !== emailState) {
    setSeenEmail(emailState);
    if (emailState.ok === false && emailState.fieldError) setEmailError(emailState.fieldError);
  }

  // Counted once: the breakdown can be emailed only once per enquiry.
  const emailCounted = useRef(false);
  useEffect(() => {
    if (emailState.ok !== true || emailCounted.current) return;
    emailCounted.current = true;
    track("email_estimate", { site_language: locale });
  }, [emailState, locale]);

  const tiles: [string, string][] = [
    [c.systemSize, summary.systemSize],
    [c.monthlySavings, summary.monthlySavings],
    [c.subsidy, summary.subsidy],
  ];

  return (
    <div data-track-location="result" className={`grid gap-4 ${padding}`}>
      <div>
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-ui font-bold text-carbon outline-none">
          {c.resultTitle}
        </h3>
        <p className="mt-1 text-small text-ink-2">{fill(c.resultFor, { segment: c.segmentNames[segment].toLowerCase(), bill: summary.billRangeLabel })}</p>
      </div>

      <dl className="grid grid-cols-3 gap-2">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-md border border-mist bg-canvas px-3 py-2.5">
            <dt className="text-small leading-tight text-grey-600">{label}</dt>
            <dd className="mt-1 font-display text-ui leading-snug font-bold text-teal-900 tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-small text-ink-2">{fill(c.note, { reference: state.reference })}</p>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/get-quote?segment=${segment}`}
          className="inline-flex min-h-10 items-center rounded-full border-2 border-teal-900 px-4 text-small font-semibold text-teal-900 transition-colors hover:bg-teal-900 hover:text-white"
        >
          {c.fullBreakdown}
        </Link>
        <a
          href={state.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center rounded-full border-2 border-teal-900 px-4 text-small font-semibold text-teal-900 transition-colors hover:bg-teal-900 hover:text-white"
        >
          {c.whatsapp}
        </a>
      </div>

      <div className="border-t border-mist pt-4">
        {emailState.ok === true ? (
          <p role="status" className="rounded-md bg-success-tint p-4 text-small text-carbon">
            {fill(c.emailSent, { email })}
          </p>
        ) : (
          <form
            action={emailAction}
            noValidate
            onSubmit={(event) => {
              const error = checkEmail(email);
              setEmailError(error);
              if (error) event.preventDefault();
            }}
            className="grid gap-1.5"
            aria-describedby={emailState.ok === false ? statusId : undefined}
          >
            <input type="hidden" name="reference" value={state.reference} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="segment" value={segment} />
            <input type="hidden" name="pincode" value={pincode} />
            <input type="hidden" name="billBucket" value={billBucket} />
            {/* Names the form in the note to sales that carries the address. */}
            <input type="hidden" name="surface" value={surface} />
            <label htmlFor={emailId} className="text-small font-semibold text-carbon">
              {c.emailLabel}
            </label>
            <div className="flex gap-2">
              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError && !checkEmail(event.target.value)) setEmailError(undefined);
                }}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? `${emailId}-error` : `${emailId}-hint`}
                placeholder={c.emailPlaceholder}
                className={`${controlClass} min-h-11 flex-1`}
              />
              <EmailButton />
            </div>
            {emailError ? (
              <FieldError id={`${emailId}-error`}>{message(c, emailError)}</FieldError>
            ) : (
              <p id={`${emailId}-hint`} className="text-small text-grey-600">
                {c.emailHint}
              </p>
            )}
            {emailState.ok === false && !emailState.fieldError && (
              <p id={statusId} role="alert" className="text-small text-error">
                {c.formErrors[emailState.errorCode]}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function EmailButton() {
  const { pending } = useFormStatus();
  const c = useCopy();
  return (
    <Button type="submit" variant="outline" disabled={pending} className="min-h-11 shrink-0 px-5">
      {pending ? c.sending : c.emailSubmit}
    </Button>
  );
}
