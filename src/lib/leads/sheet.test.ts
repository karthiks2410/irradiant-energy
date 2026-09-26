import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LeadEmailContext } from "./emails";
import { istTimestamp, postToSheet, recordInSheet, SHEET_COLUMNS, sheetConfig, sheetRowFor, type SheetConfig } from "./sheet";

/**
 * The lead register is an extra copy, never the record: whatever the Sheet does — refuse the token,
 * time out, answer nonsense — the call resolves, and the logs carry the reference and nothing else.
 * No request leaves the test: `fetch` is always a stub.
 */

const config: SheetConfig = { url: "https://script.google.com/macros/s/TEST/exec", token: "test-token-not-a-secret" };

const popupContext: LeadEmailContext = {
  lead: {
    name: "Asha Rao",
    phone: "+919845012345",
    segment: "housing-society",
    pincode: "560001",
    consent: true,
    whatsappOptIn: true,
    website: undefined,
    startedAt: 0,
  },
  reference: "IE-7K3QX2",
  estimate: null,
  submittedAt: new Date("2026-09-26T16:11:05Z"),
  locale: "kn",
  source: "quick quote popup",
  request: "site-visit",
  billRange: { label: "₹30,000–60,000", representativeBillInr: 45_000, openEnded: false },
  leadSource: {
    page: "/kn/solutions/solar/housing-society",
    landing: "/kn",
    referrer: "l.instagram.com",
    utm_source: "instagram",
    utm_medium: "social",
    utm_campaign: "bio_link",
  },
};

let logs: string[];

beforeEach(() => {
  logs = [];
  for (const level of ["info", "warn", "error"] as const) {
    vi.spyOn(console, level).mockImplementation((line: string) => {
      logs.push(line);
    });
  }
});
afterEach(() => vi.restoreAllMocks());

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("sheetConfig", () => {
  it("needs both the URL and the token", () => {
    expect(sheetConfig({})).toBeNull();
    expect(sheetConfig({ LEAD_SHEET_URL: config.url })).toBeNull();
    expect(sheetConfig({ LEAD_SHEET_TOKEN: config.token })).toBeNull();
    expect(sheetConfig({ LEAD_SHEET_URL: ` ${config.url} `, LEAD_SHEET_TOKEN: config.token })).toEqual(config);
  });

  it("accepts HTTPS, and plain HTTP only for a mock on this machine", () => {
    expect(sheetConfig({ LEAD_SHEET_URL: "http://script.google.com/x", LEAD_SHEET_TOKEN: "t" })).toBeNull();
    expect(sheetConfig({ LEAD_SHEET_URL: "not a url", LEAD_SHEET_TOKEN: "t" })).toBeNull();
    expect(sheetConfig({ LEAD_SHEET_URL: "http://127.0.0.1:4545/sheet", LEAD_SHEET_TOKEN: "t" })).not.toBeNull();
  });
});

describe("sheetRowFor", () => {
  it("fills every column the website owns, from the same facts as the alert", () => {
    const row = sheetRowFor(popupContext);
    expect(row).toEqual({
      "Received (IST)": "2026-09-26 21:41:05",
      Reference: "IE-7K3QX2",
      Form: "Site visit",
      Language: "Kannada",
      Name: "Asha Rao",
      Phone: "+919845012345",
      Email: "",
      "PIN code": "560001",
      Property: "Housing society",
      "Monthly bill": "₹30,000–60,000",
      "Sanctioned load (kW)": "",
      "Estimated system (kWp)": "",
      "WhatsApp OK": "Yes",
      Source: "instagram",
      Medium: "social",
      Campaign: "bio_link",
      "Landing page": "/kn",
      "Enquiry page": "/kn/solutions/solar/housing-society",
    });
    // Status and Notes belong to the team; the website never sends them.
    expect(Object.keys(row)).toEqual(SHEET_COLUMNS.filter((c) => c !== "Status" && c !== "Notes"));
  });

  it("names the calculator form and says 'direct or unknown' without a source", () => {
    const row = sheetRowFor({
      ...popupContext,
      source: undefined,
      request: undefined,
      billRange: undefined,
      leadSource: undefined,
      locale: "en",
      lead: { ...popupContext.lead, email: "asha@example.com", monthlyBill: 3_500, sanctionedLoadKw: 5, whatsappOptIn: false },
    });
    expect(row).toMatchObject({
      Form: "Calculator",
      Language: "English",
      Email: "asha@example.com",
      "Monthly bill": "₹3,500",
      "Sanctioned load (kW)": "5",
      "WhatsApp OK": "No",
      Source: "direct or unknown",
      Medium: "",
      "Landing page": "",
      "Enquiry page": "",
    });
  });

  it("writes Indian time whatever the server's clock zone", () => {
    expect(istTimestamp(new Date("2026-12-31T20:00:00Z"))).toBe("2027-01-01 01:30:00");
  });
});

describe("postToSheet", () => {
  const append = { action: "append" as const, row: sheetRowFor(popupContext) };

  it("skips quietly, with a PII-free log line, when the register is not set up", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    expect(await postToSheet(append, { config: null, fetchImpl })).toBe("skipped");
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(logs.map((l) => JSON.parse(l).event)).toEqual(["lead_sheet_skipped"]);
  });

  it("posts the token and the row as JSON, and logs success with the reference only", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => json({ ok: true }));
    expect(await postToSheet(append, { config, fetchImpl })).toBe("ok");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(config.url);
    expect(init?.method).toBe("POST");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const body = JSON.parse(String(init?.body));
    expect(body).toEqual({ token: config.token, action: "append", row: append.row });

    expect(logs).toHaveLength(1);
    expect(JSON.parse(logs[0])).toMatchObject({ level: "info", event: "lead_sheet_ok", reference: "IE-7K3QX2" });
  });

  it("sends the popup's email step as an update by reference", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => json({ ok: true }));
    await postToSheet({ action: "email", reference: "IE-7K3QX2", email: "asha@example.com" }, { config, fetchImpl });
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))).toEqual({
      token: config.token,
      action: "email",
      reference: "IE-7K3QX2",
      email: "asha@example.com",
    });
  });

  it("reports a refusal, an HTTP error, a garbled answer, a network error and a timeout as failed — and never throws", async () => {
    const cases: [string, typeof fetch][] = [
      ["unauthorized", async () => json({ ok: false, error: "unauthorized" })],
      ["http", async () => new Response("nope", { status: 500 })],
      ["bad-response", async () => new Response("<html>Script error</html>", { status: 200 })],
      ["TypeError", async () => Promise.reject(new TypeError("fetch failed"))],
      [
        "TimeoutError",
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(init.signal!.reason));
          }),
      ],
    ];
    for (const [errorName, fetchImpl] of cases) {
      logs = [];
      await expect(postToSheet(append, { config, fetchImpl, timeoutMs: 20 })).resolves.toBe("failed");
      expect(JSON.parse(logs[0]), errorName).toMatchObject({ event: "lead_sheet_failed", reference: "IE-7K3QX2", errorName });
    }
  });

  it("keeps every personal field and the token out of the logs", async () => {
    await postToSheet(append, { config, fetchImpl: async () => json({ ok: false, error: "unauthorized" }) });
    await postToSheet(append, { config, fetchImpl: async () => json({ ok: true }) });
    const written = logs.join("\n");
    for (const secret of ["Asha", "9845012345", "560001", "instagram", config.token]) {
      expect(written, secret).not.toContain(secret);
    }
  });
});

describe("recordInSheet", () => {
  const append = { action: "append" as const, row: sheetRowFor(popupContext) };

  it("retries a failure once, and stops there", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => json({ ok: false, error: "busy" }));
    expect(await recordInSheet(append, { config, fetchImpl, retryDelayMs: 1 })).toBe("failed");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("succeeds on the retry, for example when the email step arrives before the row exists", async () => {
    const answers = [json({ ok: false, error: "not-found" }), json({ ok: true })];
    const fetchImpl = vi.fn<typeof fetch>(async () => answers.shift()!);
    expect(await recordInSheet({ action: "email", reference: "IE-7K3QX2", email: "asha@example.com" }, { config, fetchImpl, retryDelayMs: 1 })).toBe("ok");
    expect(logs.map((l) => JSON.parse(l).event)).toEqual(["lead_sheet_failed", "lead_sheet_ok"]);
  });

  it("does not retry a success or a skip", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => json({ ok: true }));
    expect(await recordInSheet(append, { config, fetchImpl, retryDelayMs: 1 })).toBe("ok");
    expect(await recordInSheet(append, { config: null, fetchImpl, retryDelayMs: 1 })).toBe("skipped");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
