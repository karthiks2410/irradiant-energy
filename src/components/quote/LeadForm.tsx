"use client";

/**
 * Step 2. Posts to the `submitLead` Server Action through useActionState, so it also works
 * without JavaScript: the action re-renders the page with field errors and the typed values.
 *
 * The property, bill and PIN code chosen in step 1 travel as hidden fields (never as URL
 * parameters). `startedAt` is rendered by the server at request time, which both feeds the
 * action's minimum-fill-time check and stays immune to a wrong clock on the visitor's device.
 */

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitLead } from "@/app/get-quote/actions";
import { Button, CheckboxField, controlClass, FieldShell, TextField } from "@/components/ui";
import { site, whatsappLink } from "@/content/site";
import { initialLeadState, type LeadFieldErrors } from "@/lib/leads/state";
import { fieldLimits } from "./copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "./FieldRow";
import { useEstimate } from "./EstimateProvider";

const linkClass = "font-medium text-green-700 underline underline-offset-2 hover:no-underline";

/** Where the error summary sends focus for each field the action can reject. */
const errorAnchors: Record<string, { id: string; label: string }> = {
  name: { id: "lead-name", label: "Your name" },
  phone: { id: "lead-phone", label: "Mobile number" },
  email: { id: "lead-email", label: "Email address" },
  message: { id: "lead-message", label: "Your message" },
  consent: { id: "lead-consent", label: "Permission to contact you" },
  whatsappOptIn: { id: "lead-whatsapp", label: "WhatsApp updates" },
  // Carried from step 1, so the summary points back at the control that set them.
  segment: { id: "estimate-segment-home", label: "What you are putting solar on" },
  pincode: { id: "estimate-pincode", label: "PIN code" },
  monthlyBill: { id: "estimate-bill", label: "Monthly electricity bill" },
};

export function LeadForm({ startedAt }: { startedAt: number }) {
  const { segment, monthlyBill, estimate, roofArea } = useEstimate();
  const [state, formAction] = useActionState(submitLead, initialLeadState);
  const noticeRef = useRef<HTMLDivElement>(null);

  // Move focus to whichever message replaced or joined the form, so it is not missed.
  useEffect(() => {
    if (state.ok !== null) noticeRef.current?.focus();
  }, [state]);

  if (state.ok === true) {
    return (
      <div
        ref={noticeRef}
        tabIndex={-1}
        role="status"
        className="rounded-md border border-green-700 bg-success-tint p-6 sm:p-8"
      >
        <h3 className="font-display text-h3 font-bold text-carbon">Thanks — we have your request.</h3>
        <p className="mt-3 text-body text-ink-2">
          Your reference is{" "}
          <span className="font-mono font-medium text-carbon tabular-nums">{state.reference}</span>. Quote it if you
          get in touch about this enquiry.
        </p>
        <ContactFallbacks whatsappHref={state.whatsappHref} />
      </div>
    );
  }

  const fieldErrors: LeadFieldErrors = (state.ok === false && state.fieldErrors) || {};
  const values = state.ok === false ? state.values : undefined;
  const listedErrors = Object.entries(fieldErrors);

  return (
    <form action={formAction} noValidate className="grid gap-6">
      {state.ok === false && (
        <div
          ref={noticeRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-error bg-error-tint p-4 sm:p-5"
        >
          <p className="text-body font-medium text-carbon">{state.error}</p>
          {listedErrors.length > 0 && (
            <ul className="mt-2 grid gap-1">
              {listedErrors.map(([field, message]) => {
                const anchor = errorAnchors[field];
                return (
                  <li key={field} className="text-small text-ink-2">
                    <a href={`#${anchor?.id ?? "lead-name"}`} className={linkClass}>
                      {anchor?.label ?? field}
                    </a>
                    : {message}
                  </li>
                );
              })}
            </ul>
          )}
          <ContactFallbacks />
        </div>
      )}

      {/* What step 1 worked out. Hidden fields, never query parameters. */}
      <input type="hidden" name="segment" value={segment} />
      <input type="hidden" name="monthlyBill" value={String(monthlyBill)} />
      {/* Only a PIN code the engine actually accepted travels: a half-typed one would come back
          from the server as an error against a field that is not on screen. There is no estimate
          at all until step 1 has one (owner review round 2, point 8). */}
      <input type="hidden" name="pincode" value={estimate?.region.pincode ?? ""} />
      {/* The roof area the visitor entered (not estimate.roofAreaSqft, which is the area the
          recommended system needs). It caps the size, so the server recomputes with it too. */}
      <input type="hidden" name="roofAreaSqft" value={Number(roofArea) > 0 ? roofArea : ""} />
      <input type="hidden" name="startedAt" defaultValue={String(startedAt)} />

      {/* Honeypot: off-screen rather than display:none, which naive bots skip. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {/* Name has no helper text and Mobile number has one, so the row aligns through <FieldRow>
          rather than leaving the two inputs at different heights (owner review round 2, point 8). */}
      <FieldRow gap="roomy">
        <TextField
          className={fieldCellNoHelper}
          id="lead-name"
          name="name"
          required
          label="Your name"
          type="text"
          autoComplete="name"
          maxLength={fieldLimits.name}
          defaultValue={values?.name ?? ""}
          error={fieldErrors.name}
        />
        <TextField
          className={fieldCell}
          id="lead-phone"
          name="phone"
          required
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          defaultValue={values?.phone ?? ""}
          error={fieldErrors.phone}
          hint="A 10-digit Indian mobile number."
        />
      </FieldRow>

      <TextField
        id="lead-email"
        name="email"
        required
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        maxLength={fieldLimits.email}
        defaultValue={values?.email ?? ""}
        error={fieldErrors.email}
      />

      <FieldShell id="lead-message" label="Anything we should know?" optional error={fieldErrors.message}>
        {(a11y) => (
          <textarea
            id="lead-message"
            name="message"
            rows={4}
            maxLength={fieldLimits.message}
            defaultValue={values?.message ?? ""}
            {...a11y}
            className={`${controlClass} py-3`}
          />
        )}
      </FieldShell>

      <div className="grid gap-2">
        {/* PROPOSED CONTENT — REQUIRES CLIENT APPROVAL: consent wording carries legal weight
            and the privacy notice it points to is still with counsel (content-inventory CL-25). */}
        <CheckboxField
          id="lead-consent"
          name="consent"
          required
          error={fieldErrors.consent}
          label={
            <>
              I agree to be contacted about my enquiry and have read the{" "}
              <Link href="/privacy" className={linkClass}>
                privacy notice
              </Link>
              .
            </>
          }
        />
        <CheckboxField
          id="lead-whatsapp"
          name="whatsappOptIn"
          error={fieldErrors.whatsappOptIn}
          label="You can also reach me on WhatsApp about this enquiry."
        />
      </div>

      {/* PROPOSED CONTENT — REQUIRES CLIENT APPROVAL. Not a blocker: the request still sends, it
          simply carries no figures until step 1 has the PIN code it needs. */}
      {estimate === null && (
        <p className="text-small text-ink-2">
          <a href="#estimate-pincode" className={linkClass}>
            Add your PIN code in step 1
          </a>{" "}
          and your estimate travels with this request.
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button type="submit" arrow disabled={pending}>
        {pending ? "Sending…" : "Send my request"}
      </Button>
      <p role="status" className="sr-only">
        {pending ? "Sending your request" : ""}
      </p>
    </div>
  );
}

/** Always offered beside an error and after a success: the form is never the only way through. */
function ContactFallbacks({ whatsappHref }: { whatsappHref?: string }) {
  const phone = site.contact.phonePrimary.value;
  return (
    <p className="mt-4 text-body text-ink-2">
      Prefer to talk?{" "}
      <a href={whatsappHref ?? whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkClass}>
        WhatsApp us
      </a>{" "}
      or call{" "}
      <a href={`tel:${phone.tel}`} className={`${linkClass} tabular-nums`}>
        {phone.display}
      </a>
      .
    </p>
  );
}
