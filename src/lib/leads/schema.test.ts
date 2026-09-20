import { describe, expect, it } from "vitest";
import { MIN_FILL_TIME_MS, parseLeadForm } from "./schema";

const NOW = 1_800_000_000_000;

function form(overrides: Record<string, string | undefined> = {}): FormData {
  const base: Record<string, string | undefined> = {
    name: "Asha Rao",
    phone: "+91 98457 94343",
    email: "Asha@Example.com",
    segment: "home",
    pincode: "560001",
    monthlyBill: "3500",
    message: "",
    consent: "on",
    startedAt: String(NOW - 10_000),
    ...overrides,
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries(base)) if (v !== undefined) fd.set(k, v);
  return fd;
}

describe("parseLeadForm", () => {
  it("accepts a complete form and normalises the values", () => {
    const result = parseLeadForm(form(), NOW);
    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") return;
    expect(result.lead.phone).toBe("+919845794343");
    expect(result.lead.email).toBe("asha@example.com");
    expect(result.lead.pincode).toBe("560001");
    expect(result.lead.monthlyBill).toBe(3500);
    expect(result.lead.message).toBeUndefined();
    expect(result.lead.consent).toBe(true);
    expect(result.lead.whatsappOptIn).toBe(false);
  });

  it("normalises the other phone spellings and rejects landlines and foreign numbers", () => {
    for (const phone of ["9845794343", "09845794343", "919845794343", "+91-98457-94343"]) {
      const r = parseLeadForm(form({ phone }), NOW);
      expect(r.kind, phone).toBe("ok");
      if (r.kind === "ok") expect(r.lead.phone).toBe("+919845794343");
    }
    for (const phone of ["0801234567", "5845794343", "1234567890", "+44 7700 900123", "98457"]) {
      const r = parseLeadForm(form({ phone }), NOW);
      expect(r.kind, phone).toBe("invalid");
      if (r.kind === "invalid") expect(r.fieldErrors.phone).toBeDefined();
    }
  });

  it("requires consent to be an affirmative choice", () => {
    const r = parseLeadForm(form({ consent: undefined }), NOW);
    expect(r.kind).toBe("invalid");
    if (r.kind === "invalid") expect(r.fieldErrors.consent).toBeDefined();
    const opted = parseLeadForm(form({ whatsappOptIn: "on" }), NOW);
    if (opted.kind === "ok") expect(opted.lead.whatsappOptIn).toBe(true);
  });

  it("treats optional fields as absent when empty and validates them when present", () => {
    const empty = parseLeadForm(form({ pincode: "", monthlyBill: "" }), NOW);
    expect(empty.kind).toBe("ok");
    if (empty.kind === "ok") {
      expect(empty.lead.pincode).toBeUndefined();
      expect(empty.lead.monthlyBill).toBeUndefined();
    }
    const bad = parseLeadForm(form({ pincode: "0123", monthlyBill: "lots" }), NOW);
    expect(bad.kind).toBe("invalid");
    if (bad.kind === "invalid") {
      expect(bad.fieldErrors.pincode).toBeDefined();
      expect(bad.fieldErrors.monthlyBill).toBeDefined();
    }
  });

  it("carries the roof area through and drops an unusable one without failing the form", () => {
    const sized = parseLeadForm(form({ roofAreaSqft: "450" }), NOW);
    expect(sized.kind).toBe("ok");
    if (sized.kind === "ok") expect(sized.lead.roofAreaSqft).toBe(450);

    // It is a hidden field the visitor never types into, so junk is ignored rather than
    // reported against a control that is not on screen.
    for (const roofAreaSqft of ["", "0", "-5", "huge"]) {
      const result = parseLeadForm(form({ roofAreaSqft }), NOW);
      expect(result.kind).toBe("ok");
      if (result.kind === "ok") expect(result.lead.roofAreaSqft).toBeUndefined();
    }
  });

  it("limits the message and allows Kannada names", () => {
    const long = parseLeadForm(form({ message: "x".repeat(501) }), NOW);
    expect(long.kind).toBe("invalid");
    const kannada = parseLeadForm(form({ name: "ಆಶಾ ರಾವ್" }), NOW);
    expect(kannada.kind).toBe("ok");
    const junk = parseLeadForm(form({ name: "<script>" }), NOW);
    expect(junk.kind).toBe("invalid");
  });

  it("classifies a filled honeypot as spam and a fast submit as too fast", () => {
    expect(parseLeadForm(form({ website: "http://spam.example" }), NOW).kind).toBe("spam");
    expect(parseLeadForm(form({ startedAt: String(NOW - MIN_FILL_TIME_MS + 1) }), NOW).kind).toBe("too-fast");
    expect(parseLeadForm(form({ startedAt: String(NOW - MIN_FILL_TIME_MS) }), NOW).kind).toBe("ok");
    expect(parseLeadForm(form({ startedAt: "soon" }), NOW).kind).toBe("too-fast");
    expect(parseLeadForm(form({ startedAt: undefined }), NOW).kind).toBe("too-fast");
  });

  it("reports one message per field", () => {
    const r = parseLeadForm(form({ name: "", email: "nope", segment: "farm" }), NOW);
    expect(r.kind).toBe("invalid");
    if (r.kind !== "invalid") return;
    expect(Object.keys(r.fieldErrors).sort()).toEqual(["email", "name", "segment"]);
  });
});
