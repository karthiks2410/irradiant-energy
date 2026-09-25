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
 * PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: every string in COPY, and the society and business
 * bill ranges in src/lib/leads/quick.ts.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { emailQuickQuote, submitQuickQuote } from "@/app/get-quote/actions";
import { Button, CheckboxField, TextField } from "@/components/ui";
import { ChoiceChips } from "@/components/ui/fields/ChoiceChips";
import { BILL_BUCKETS, bucketLabel } from "@/lib/leads/quick";
import { checkEmail, checkName, checkPhone, checkPincode, LEAD_MESSAGES } from "@/lib/leads/rules";
import type { QuickLeadField } from "@/lib/leads/schema";
import { initialQuickEmailState, initialQuickQuoteState } from "@/lib/leads/state";
import { SEGMENT_LABELS, SEGMENTS, type Segment } from "@/lib/solar/constants";

export type QuickQuoteIntent = "quote" | "site-visit";

const OPEN_EVENT = "irradiant:quick-quote";

/** Opens the popup from anywhere on the page. */
export function openQuickQuote(intent: QuickQuoteIntent = "quote") {
  window.dispatchEvent(new CustomEvent<QuickQuoteIntent>(OPEN_EVENT, { detail: intent }));
}

const COPY = {
  quote: {
    title: "Get a free quote",
    lead: "Your estimate appears as soon as you send this. We then arrange a free site visit and a written quotation.",
    submit: "See my estimate",
  },
  "site-visit": {
    title: "Book a free site visit",
    lead: "We check your roof, shading and connection, then send you a written quotation. You see an estimate straight away.",
    submit: "Book my visit",
  },
  close: "Close",
  name: "Name",
  phone: "WhatsApp number",
  phoneHint: "We call or message you on this number.",
  pincode: "PIN code",
  segment: "Property",
  bill: "Monthly electricity bill",
  consent: "I agree that Irradiant Energy may call me or message me on WhatsApp on this number about this enquiry, and I have read the",
  privacy: "privacy notice",
  sending: "Sending…",
  resultTitle: "Your estimate",
  resultFor: (bill: string, segment: string) => `For a ${segment.toLowerCase()} with a bill of ${bill} a month`,
  systemSize: "System size",
  monthlySavings: "Monthly savings",
  subsidy: "PM Surya Ghar subsidy",
  disclaimer:
    "Worked out from your bill range, so these are estimates, not a quote. A site visit confirms your roof, shading and final price.",
  reference: (ref: string) => `Your reference is ${ref}. We will contact you on the number you gave.`,
  fullBreakdown: "See the full breakdown",
  whatsapp: "Talk to us on WhatsApp",
  emailLabel: "Email me the full breakdown",
  emailHint: "Optional. We send this one email and add you to nothing.",
  emailSubmit: "Send",
  emailSent: (to: string) => `Sent to ${to}. It has the cost, the subsidy and the payback as well.`,
  failedWhatsapp: "Send it on WhatsApp instead",
} as const;

/** The page decides the starting property type; everywhere else starts on "Home". */
function segmentFromPath(pathname: string): Segment {
  const match = pathname.match(/\/solutions\/solar\/(home|housing-society|commercial)(?:\/|$)/);
  return (match?.[1] as Segment | undefined) ?? "home";
}

const SEGMENT_OPTIONS = SEGMENTS.map((value) => ({ value, label: SEGMENT_LABELS[value] }));

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
export function QuickQuoteDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [intent, setIntent] = useState<QuickQuoteIntent>("quote");
  const [segment, setSegment] = useState<Segment>("home");
  const [startedAt, setStartedAt] = useState(0);
  // A finished enquiry starts fresh next time; a half-filled one is kept if the dialog was closed.
  const [session, setSession] = useState(0);
  const finished = useRef(false);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const dialog = dialogRef.current;
      if (!dialog || dialog.open) return;
      if (finished.current) {
        setSession((n) => n + 1);
        finished.current = false;
      }
      setIntent((event as CustomEvent<QuickQuoteIntent>).detail ?? "quote");
      setSegment(segmentFromPath(window.location.pathname));
      setStartedAt(Date.now());
      document.documentElement.setAttribute("data-scroll-locked", "");
      dialog.showModal();
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Leaving the page closes it, like the mobile menu.
  useEffect(() => {
    close();
  }, [pathname, close]);

  const copy = COPY[intent];

  return (
    <dialog
      ref={dialogRef}
      onClose={() => document.documentElement.removeAttribute("data-scroll-locked")}
      aria-labelledby="quick-quote-title"
      data-lenis-prevent
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-lg bg-white p-0 text-carbon shadow-overlay backdrop:bg-teal-975/60 max-sm:mb-0 max-sm:max-h-[calc(100dvh-1rem)] max-sm:w-full max-sm:max-w-none max-sm:rounded-b-none"
    >
      <div className="flex items-start justify-between gap-4 border-b border-mist p-5 sm:p-6">
        <div>
          <h2 id="quick-quote-title" className="font-display text-h3 font-bold text-carbon">
            {copy.title}
          </h2>
          <p className="mt-1 text-small text-ink-2">{copy.lead}</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-mist text-teal-900 transition-colors hover:bg-canvas"
        >
          <span className="sr-only">{COPY.close}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <QuickQuoteBody
        key={session}
        intent={intent}
        segment={segment}
        onSegmentChange={setSegment}
        startedAt={startedAt}
        onFinished={() => {
          finished.current = true;
        }}
      />
    </dialog>
  );
}

function QuickQuoteBody({
  intent,
  segment,
  onSegmentChange,
  startedAt,
  onFinished,
}: {
  intent: QuickQuoteIntent;
  segment: Segment;
  onSegmentChange: (segment: Segment) => void;
  startedAt: number;
  onFinished: () => void;
}) {
  const [state, formAction] = useActionState(submitQuickQuote, initialQuickQuoteState);
  const [bucket, setBucket] = useState("");
  const [name, setName] = useState("");
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState<Partial<Record<QuickLeadField, string>>>({});
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
  const bucketOptions = buckets.map((b, i) => ({ value: b.id, label: bucketLabel(b, i === 0) }));

  const validate = (form: HTMLFormElement): Partial<Record<QuickLeadField, string>> => {
    const data = new FormData(form);
    const text = (key: string) => String(data.get(key) ?? "");
    const found: Partial<Record<QuickLeadField, string>> = {};
    const nameError = checkName(text("name"));
    if (nameError) found.name = nameError;
    const phoneError = text("phone").trim() === "" ? LEAD_MESSAGES.phoneMissing : checkPhone(text("phone"));
    if (phoneError) found.phone = phoneError;
    const pinError = checkPincode(text("pincode"));
    if (pinError) found.pincode = pinError;
    if (!data.get("billBucket")) found.billBucket = LEAD_MESSAGES.billRange;
    if (!data.get("consent")) found.consent = LEAD_MESSAGES.consent;
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
    <form action={formAction} onSubmit={onSubmit} noValidate className="grid gap-5 p-5 sm:p-6">
      {state.ok === false && (
        <p ref={errorSummaryRef} tabIndex={-1} role="alert" className="rounded-md bg-error-tint p-4 text-small text-carbon">
          {state.error}{" "}
          {state.whatsappHref && (
            <a href={state.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-700 underline underline-offset-2">
              {COPY.failedWhatsapp}
            </a>
          )}
        </p>
      )}

      <input type="hidden" name="startedAt" value={String(startedAt)} />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="qq-website">Website</label>
        <input id="qq-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <TextField
        id="qq-name"
        name="name"
        label={COPY.name}
        autoComplete="name"
        required
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          recheck("name", event.target.value);
        }}
        error={errors.name}
      />
      <TextField
        id="qq-phone"
        name="phone"
        type="tel"
        label={COPY.phone}
        hint={COPY.phoneHint}
        prefix="+91"
        inputMode="tel"
        autoComplete="tel-national"
        required
        onChange={(event) => recheck("phone", event.target.value)}
        error={errors.phone}
      />
      <TextField
        id="qq-pincode"
        name="pincode"
        label={COPY.pincode}
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
        error={errors.pincode}
      />

      <ChoiceChips
        name="segment"
        legend={COPY.segment}
        options={SEGMENT_OPTIONS}
        value={segment}
        onChange={(event) => {
          onSegmentChange(event.target.value as Segment);
          setBucket("");
        }}
      />
      <ChoiceChips
        name="billBucket"
        legend={COPY.bill}
        options={bucketOptions}
        value={bucket}
        onChange={(event) => {
          setBucket(event.target.value);
          setErrors((prev) => ({ ...prev, billBucket: undefined }));
        }}
        required
        error={errors.billBucket}
      />

      <CheckboxField
        id="qq-consent"
        name="consent"
        required
        error={errors.consent}
        onChange={(event) => event.target.checked && setErrors((prev) => ({ ...prev, consent: undefined }))}
        label={
          <>
            {COPY.consent}{" "}
            <Link href="/privacy" className="font-medium text-green-700 underline underline-offset-2 hover:no-underline">
              {COPY.privacy}
            </Link>
            .
          </>
        }
      />

      <SubmitButton label={COPY[intent].submit} />
    </form>
  );
}

const QUICK_ORDER: QuickLeadField[] = ["name", "phone", "pincode", "billBucket", "consent"];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" arrow disabled={pending} className="w-full justify-center sm:w-auto">
      {pending ? COPY.sending : label}
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
  const [emailState, emailAction] = useActionState(emailQuickQuote, initialQuickEmailState);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
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
    [COPY.systemSize, summary.systemSize],
    [COPY.monthlySavings, summary.monthlySavings],
    [COPY.subsidy, summary.subsidy],
  ];

  return (
    <div className="grid gap-5 p-5 sm:p-6">
      <div>
        <h3 ref={headingRef} tabIndex={-1} className="font-display text-h4 font-semibold text-carbon outline-none">
          {COPY.resultTitle}
        </h3>
        <p className="mt-1 text-small text-ink-2">{COPY.resultFor(summary.billRangeLabel, SEGMENT_LABELS[segment])}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-md border border-mist bg-canvas p-4">
            <dt className="text-small text-grey-600">{label}</dt>
            <dd className="mt-1 font-display text-h4 font-semibold text-teal-900">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-small text-ink-2">{COPY.disclaimer}</p>
      <p className="text-small text-ink-2">{COPY.reference(state.reference)}</p>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/get-quote?segment=${segment}`}
          className="inline-flex min-h-11 items-center rounded-full border-2 border-teal-900 px-5 font-semibold text-teal-900 transition-colors hover:bg-teal-900 hover:text-white"
        >
          {COPY.fullBreakdown}
        </Link>
        <a
          href={state.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-teal-900 px-5 font-semibold text-teal-900 transition-colors hover:bg-teal-900 hover:text-white"
        >
          {COPY.whatsapp}
        </a>
      </div>

      <div className="border-t border-mist pt-5">
        {emailState.ok === true ? (
          <p role="status" className="rounded-md bg-success-tint p-4 text-small text-carbon">
            {COPY.emailSent(email)}
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
            className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start"
            aria-describedby={emailState.ok === false ? statusId : undefined}
          >
            <input type="hidden" name="reference" value={state.reference} />
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="segment" value={segment} />
            <input type="hidden" name="pincode" value={pincode} />
            <input type="hidden" name="billBucket" value={billBucket} />
            <TextField
              id="qq-email"
              name="email"
              type="email"
              label={COPY.emailLabel}
              hint={COPY.emailHint}
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={emailError}
            />
            <div className="sm:pt-8">
              <EmailButton />
            </div>
            {emailState.ok === false && !emailState.fieldError && (
              <p id={statusId} role="alert" className="text-small text-error sm:col-span-2">
                {emailState.error}
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
  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? COPY.sending : COPY.emailSubmit}
    </Button>
  );
}
