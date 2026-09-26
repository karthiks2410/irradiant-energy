"use client";

/**
 * The one-tap quote popup: a header button on every page opens a short form (name, WhatsApp number,
 * PIN, bill range, one consent tick), and submitting it shows the estimate straight away.
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
 *
 * Consent is one unticked box that names both channels the visitor's number will be used on, for
 * this enquiry only (DPDP: free, specific, informed, unambiguous, an affirmative act). Closing the
 * dialog is as easy as submitting it: a plain close button, no "no thanks" link, no urgency.
 *
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: the popup's words (src/content/ui.ts `quickQuote`,
 * overlaid in Kannada) and the society and business bill ranges in src/lib/leads/quick.ts.
 */

import { usePathname } from "next/navigation";
import { createContext, useActionState, useCallback, useContext, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Link, useLocale } from "@/components/i18n/LocaleLink";
import type { QuotePage } from "@/content/quote";
import type { Ui } from "@/content/ui";
import { fill } from "@/i18n/format";
import { LEAD_ERROR_PARAMS, type LeadFieldErrorCode } from "@/lib/leads/errors";
import { emailQuickQuote, submitQuickQuote } from "@/lib/leads/submit-lead";
import { Button, CheckboxField, controlClass, FieldError, TextField } from "@/components/ui";
import { ChoiceChips } from "@/components/ui/fields/ChoiceChips";
import { BILL_BUCKETS, bucketLabel } from "@/lib/leads/quick";
import { checkEmail, checkName, checkPhone, checkPincode } from "@/lib/leads/rules";
import type { QuickLeadField } from "@/lib/leads/schema";
import { initialQuickEmailState, initialQuickQuoteState, type QuickEmailState, type QuickQuoteState } from "@/lib/leads/state";
import { saveQuickQuoteResume, takeQuickQuoteResume, type QuickQuoteResume } from "./stale-resume";
import { SEGMENTS, type Segment } from "@/lib/solar/constants";

export type QuickQuoteIntent = "quote" | "site-visit";

const OPEN_EVENT = "irradiant:quick-quote";

/** Opens the popup from anywhere on the page. */
export function openQuickQuote(intent: QuickQuoteIntent = "quote") {
  window.dispatchEvent(new CustomEvent<QuickQuoteIntent>(OPEN_EVENT, { detail: intent }));
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
  if (!copy) throw new Error("QuickQuote copy is missing: mount <QuickQuoteDialog copy={…}>.");
  return copy;
}

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
  variant = "primary",
  className,
  children,
}: {
  intent?: QuickQuoteIntent;
  variant?: "primary" | "light" | "outline" | "outline-light";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Button variant={variant} arrow className={className} aria-haspopup="dialog" onClick={() => openQuickQuote(intent)}>
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
      setResume(recovered);
      setIntent(recovered?.intent ?? (event as CustomEvent<QuickQuoteIntent>).detail ?? "quote");
      setSegment(recovered?.segment ?? segmentFromPath(window.location.pathname));
      setStartedAt(recovered?.startedAt ?? Date.now());
      show();
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
    const saved = takeQuickQuoteResume(window.location.pathname);
    if (!saved) return;
    pendingResume.current = saved;
    openQuickQuote(saved.intent);
  }, []);

  const copy = intentCopy(c, intent);

  return (
    <dialog
      ref={dialogRef}
      onClose={() => document.documentElement.removeAttribute("data-scroll-locked")}
      aria-labelledby="quick-quote-title"
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

function QuickQuoteBody({
  resume,
  intent,
  segment,
  onSegmentChange,
  startedAt,
  onFinished,
}: {
  resume: QuickQuoteResume | null;
  intent: QuickQuoteIntent;
  segment: Segment;
  onSegmentChange: (segment: Segment) => void;
  startedAt: number;
  onFinished: () => void;
}) {
  const c = useCopy();
  const locale = useLocale();
  const [state, formAction] = useActionState(
    async (previous: QuickQuoteState, data: FormData): Promise<QuickQuoteState> => {
      try {
        return await submitQuickQuote(previous, data);
      } catch {
        // The action could not be reached: almost always a deploy since this page loaded
        // (stale-resume.ts). Keep what was typed, reload onto the new build, reopen filled in.
        const text = (key: string) => String(data.get(key) ?? "");
        const saved = saveQuickQuoteResume({
          path: window.location.pathname,
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

  // A new result from the server replaces the field errors. Adjusting during render rather than in
  // an effect avoids a second render pass (react.dev "you might not need an effect").
  const [seen, setSeen] = useState(state);
  if (seen !== state) {
    setSeen(state);
    if (state.ok === false && state.fieldErrors) setErrors(state.fieldErrors);
  }

  // Side effects only: tell the dialog this enquiry is done, and move focus to a failure message.
  useEffect(() => {
    if (state.ok === true) onFinished();
    if (state.ok === false) errorSummaryRef.current?.focus();
  }, [state, onFinished]);

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
        state={state}
        segment={segment}
        name={name}
        pincode={pincode}
        billBucket={bucket}
      />
    );
  }

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid gap-4 px-5 pt-4 pb-5">
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
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="qq-website">Website</label>
        <input id="qq-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        id="qq-name"
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
        id="qq-phone"
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
        id="qq-pincode"
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
        id="qq-consent"
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
  state,
  segment,
  name,
  pincode,
  billBucket,
}: {
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

  // Move focus to the result, so a screen-reader user hears what changed.
  useEffect(() => headingRef.current?.focus(), []);
  const [seenEmail, setSeenEmail] = useState(emailState);
  if (seenEmail !== emailState) {
    setSeenEmail(emailState);
    if (emailState.ok === false && emailState.fieldError) setEmailError(emailState.fieldError);
  }

  const tiles: [string, string][] = [
    [c.systemSize, summary.systemSize],
    [c.monthlySavings, summary.monthlySavings],
    [c.subsidy, summary.subsidy],
  ];

  return (
    <div className="grid gap-4 px-5 pt-4 pb-5">
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
            <label htmlFor="qq-email" className="text-small font-semibold text-carbon">
              {c.emailLabel}
            </label>
            <div className="flex gap-2">
              <input
                id="qq-email"
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
                aria-describedby={emailError ? "qq-email-error" : "qq-email-hint"}
                placeholder={c.emailPlaceholder}
                className={`${controlClass} min-h-11 flex-1`}
              />
              <EmailButton />
            </div>
            {emailError ? (
              <FieldError id="qq-email-error">{message(c, emailError)}</FieldError>
            ) : (
              <p id="qq-email-hint" className="text-small text-grey-600">
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
