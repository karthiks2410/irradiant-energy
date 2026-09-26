"use client";

/**
 * Step 2. Posts to the `submitLead` Server Action through useActionState, so it also works
 * without JavaScript: the action re-renders the page with field errors and the typed values.
 *
 * The property, bill and PIN code chosen in step 1 travel as hidden fields (never as URL
 * parameters). `startedAt` is rendered by the server at request time, which both feeds the
 * action's minimum-fill-time check and stays immune to a wrong clock on the visitor's device.
 *
 * The action answers in CODES, not sentences. One action id serves both locale trees, so it
 * cannot know which language to refuse in until it has read the request, and a Kannada page
 * meeting an English error at the moment of submitting is the worst place to find one. The
 * wording is looked up here, from copy this component was handed
 * (docs/kannada/research/architecture.md §6.12). The locale itself rides along as a hidden
 * field, because a Server Action cannot read `next/root-params`.
 */

import { Link } from "@/components/i18n/LocaleLink";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitLead } from "@/lib/leads/submit-lead";
import { Button, CheckboxField, controlClass, FieldShell, TextField } from "@/components/ui";
import type { QuotePage } from "@/content/quote";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { LEAD_ERROR_PARAMS, isLeadFieldErrorCode } from "@/lib/leads/errors";
import { echoLeadValues, initialLeadState, type LeadActionState, type LeadFieldErrors } from "@/lib/leads/state";
import { fieldLimits } from "./copy";
import { FieldRow, fieldCell, fieldCellNoHelper } from "./FieldRow";
import { fillTags } from "./template";
import { useEstimate } from "./EstimateProvider";

const linkClass = "font-medium text-green-700 underline underline-offset-2 hover:no-underline";

export type LeadFormCopy = QuotePage["form"];

/**
 * Where the error summary sends focus for each field the action can reject, and which name the
 * link goes by. The ids are English-owned (they are element ids); the names are copy.
 */
function errorAnchors(copy: LeadFormCopy): Record<string, { id: string; label: string }> {
  const names = copy.errorSummary;
  return {
    name: { id: "lead-name", label: names.yourName },
    phone: { id: "lead-phone", label: names.phone },
    email: { id: "lead-email", label: names.email },
    message: { id: "lead-message", label: names.message },
    consent: { id: "lead-consent", label: names.consent },
    whatsappOptIn: { id: "lead-whatsapp", label: names.whatsappOptIn },
    // Carried from step 1, so the summary points back at the control that set them.
    segment: { id: "estimate-segment-home", label: names.segment },
    pincode: { id: "estimate-pincode", label: names.pincode },
    monthlyBill: { id: "estimate-bill", label: names.monthlyBill },
  };
}

/**
 * The sentence for a field error code.
 *
 * An unknown code is shown as itself rather than swallowed: it means the action and the copy
 * have drifted, which is a bug worth seeing, and it is never a sentence a visitor can mistake
 * for advice.
 */
function fieldMessage(copy: LeadFormCopy, code: string): string {
  if (!isLeadFieldErrorCode(code)) return code;
  return fill(copy.fieldErrors[code], LEAD_ERROR_PARAMS[code] ?? {});
}

/**
 * The two ways through that are not this form: WhatsApp and the phone.
 *
 * They arrive as props rather than from `@/content/site`, because this module hydrates and a
 * client bundle may not import copy (scripts/check-client-content.ts).
 */
export type ContactFallbackProps = {
  phone: { display: string; tel: string };
  /** The default WhatsApp link; a failed submission replaces it with one carrying a reference. */
  whatsappHref: string;
};

export function LeadForm({
  startedAt,
  canSend,
  contact,
  copy,
  optionalMarker,
  locale,
}: {
  startedAt: number;
  canSend: boolean;
  contact: ContactFallbackProps;
  copy: LeadFormCopy;
  /** "(optional)" beside an optional field's label; it belongs to `ui.fields`, not to this form. */
  optionalMarker: string;
  /** Posted with the form so the action knows which language to send the customer's email in. */
  locale: Locale;
}) {
  const { segment, monthlyBill, estimate, sanctionedLoad } = useEstimate();
  const [state, formAction] = useActionState(
    async (previous: LeadActionState, data: FormData): Promise<LeadActionState> => {
      try {
        return await submitLead(previous, data);
      } catch {
        // The action could not be reached: a deploy since this page loaded, or offline. Keep what
        // was typed and say how to finish (see src/components/quote/stale-resume.ts).
        return { ok: false, errorCode: navigator.onLine === false ? "send" : "stale", values: echoLeadValues(data) };
      }
    },
    initialLeadState,
  );
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
        <h3 className="font-display text-h3 font-bold text-carbon">{copy.successHeading}</h3>
        <p className="mt-3 text-body text-ink-2">
          {fillTags(copy.successReference, {
            spacing: "detach",
            values: { reference: state.reference },
            tags: {
              ref: (children) => (
                <span className="font-mono font-medium text-carbon tabular-nums">{children}</span>
              ),
            },
          })}
        </p>
        <ContactFallbacks contact={contact} copy={copy} whatsappHref={state.whatsappHref} />
      </div>
    );
  }

  const fieldErrors: LeadFieldErrors = (state.ok === false && state.fieldErrors) || {};
  const values = state.ok === false ? state.values : undefined;
  const listedErrors = Object.entries(fieldErrors);
  const anchors = errorAnchors(copy);

  return (
    <form action={formAction} noValidate className="grid gap-6">
      {state.ok === false && (
        <div
          ref={noticeRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-error bg-error-tint p-4 sm:p-5"
        >
          {/* `devMessage` is the local "set RESEND_API_KEY" hint, which stays English: it is an
              instruction to whoever is running the site, not copy for a visitor. */}
          <p className="text-body font-medium text-carbon">
            {state.devMessage ?? copy.formErrors[state.errorCode]}
          </p>
          {listedErrors.length > 0 && (
            <ul className="mt-2 grid gap-1">
              {listedErrors.map(([field, code]) => {
                const anchor = anchors[field];
                return (
                  <li key={field} className="text-small text-ink-2">
                    <a href={`#${anchor?.id ?? "lead-name"}`} className={linkClass}>
                      {anchor?.label ?? field}
                    </a>
                    : {fieldMessage(copy, code)}
                  </li>
                );
              })}
            </ul>
          )}
          {/* On a delivery failure the action hands back the reference the email would have
              quoted and a WhatsApp link carrying it, so the visitor can rescue an enquiry
              nothing else is holding. On a validation error there is neither, and the plain
              link is right. */}
          {state.ok === false && state.reference && (
            <p className="mt-2 text-small text-ink-2">
              {fillTags(copy.errorReference, {
                spacing: "detach",
                values: { reference: state.reference },
                tags: {
                  ref: (children) => (
                    <span className="font-mono font-medium text-carbon tabular-nums">{children}</span>
                  ),
                },
              })}
            </p>
          )}
          <ContactFallbacks
            contact={contact}
            copy={copy}
            whatsappHref={state.ok === false ? state.whatsappHref : undefined}
          />
        </div>
      )}

      {/* What step 1 worked out. Hidden fields, never query parameters. */}
      <input type="hidden" name="segment" value={segment} />
      <input type="hidden" name="monthlyBill" value={String(monthlyBill)} />
      {/* Only a PIN code the engine actually accepted travels: a half-typed one would come back
          from the server as an error against a field that is not on screen. */}
      <input type="hidden" name="pincode" value={estimate?.region.pincode ?? ""} />
      <input type="hidden" name="sanctionedLoadKw" value={Number(sanctionedLoad) > 0 ? sanctionedLoad : ""} />
      <input type="hidden" name="startedAt" defaultValue={String(startedAt)} />
      {/* Which page this was sent from, so the acknowledgement is written in the language the
          visitor was reading. A Server Action has no access to next/root-params. */}
      <input type="hidden" name="locale" defaultValue={locale} />

      {/* Honeypot: off-screen rather than display:none, which naive bots skip. The label is
          English on purpose — it is hidden from people and read only by the bots it catches. */}
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
          label={copy.labels.yourName}
          type="text"
          autoComplete="name"
          maxLength={fieldLimits.name}
          defaultValue={values?.name ?? ""}
          error={fieldErrors.name && fieldMessage(copy, fieldErrors.name)}
        />
        <TextField
          className={fieldCell}
          id="lead-phone"
          name="phone"
          required
          label={copy.labels.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={16}
          defaultValue={values?.phone ?? ""}
          error={fieldErrors.phone && fieldMessage(copy, fieldErrors.phone)}
          hint={copy.labels.phoneHint}
        />
      </FieldRow>

      <TextField
        id="lead-email"
        name="email"
        required
        label={copy.labels.email}
        type="email"
        inputMode="email"
        autoComplete="email"
        maxLength={fieldLimits.email}
        defaultValue={values?.email ?? ""}
        error={fieldErrors.email && fieldMessage(copy, fieldErrors.email)}
      />

      <FieldShell
        id="lead-message"
        label={copy.labels.message}
        optional
        optionalLabel={optionalMarker}
        error={fieldErrors.message && fieldMessage(copy, fieldErrors.message)}
      >
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
        <CheckboxField
          id="lead-consent"
          name="consent"
          required
          error={fieldErrors.consent && fieldMessage(copy, fieldErrors.consent)}
          label={fillTags(copy.labels.consent, {
            spacing: "detach",
            tags: {
              privacy: (children) => (
                <Link href="/privacy" className={linkClass}>
                  {children}
                </Link>
              ),
            },
          })}
        />
        <CheckboxField
          id="lead-whatsapp"
          name="whatsappOptIn"
          error={fieldErrors.whatsappOptIn && fieldMessage(copy, fieldErrors.whatsappOptIn)}
          label={copy.labels.whatsappOptIn}
        />
      </div>

      <SubmitButton canSend={canSend} copy={copy} />
    </form>
  );
}

/**
 * `canSend` is false while the site has no working mail — the domain is on registrar hold, so
 * Resend cannot be verified. Only the button is disabled: everything above it still works, and
 * the calculator is a different component entirely, so the figures are unaffected.
 */
function SubmitButton({ canSend, copy }: { canSend: boolean; copy: LeadFormCopy }) {
  const { pending } = useFormStatus();
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" arrow disabled={pending || !canSend}>
          {pending ? copy.submitPending : copy.submit}
        </Button>
        <p role="status" className="sr-only">
          {pending ? copy.srSending : ""}
        </p>
      </div>
      {!canSend && <p className="text-small text-ink-2">{copy.sendingOff}</p>}
    </div>
  );
}

/** Always offered beside an error and after a success: the form is never the only way through. */
function ContactFallbacks({
  contact,
  copy,
  whatsappHref,
}: {
  contact: ContactFallbackProps;
  copy: LeadFormCopy;
  whatsappHref?: string;
}) {
  const phone = contact.phone;
  return (
    <p className="mt-4 text-body text-ink-2">
      {fillTags(copy.fallback, {
        spacing: "detach",
        values: { phone: phone.display },
        tags: {
          whatsapp: (children) => (
            <a href={whatsappHref ?? contact.whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {children}
            </a>
          ),
          tel: (children) => (
            <a href={`tel:${phone.tel}`} className={`${linkClass} tabular-nums`}>
              {children}
            </a>
          ),
        },
      })}
    </p>
  );
}
