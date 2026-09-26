/**
 * The lead register's Apps Script (integrations/google-sheet/Code.gs), run in Node against an
 * in-memory stand-in for the Sheets API. Apps Script cannot be unit-tested where it runs, and its
 * safety rules — the token, the apostrophe that stops formulas, the team's own cells — are exactly
 * what must not regress when someone edits the script.
 *
 * The fake models one Sheets behaviour that matters here: a value written with a leading apostrophe
 * is stored as text and read back without it, and any other value that starts with "=" is a formula.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { beforeEach, describe, expect, it } from "vitest";
import { SHEET_COLUMNS } from "./sheet";

const SCRIPT = readFileSync(fileURLToPath(new URL("../../../integrations/google-sheet/Code.gs", import.meta.url)), "utf8");
const TOKEN = "test-token-for-the-fake-only-0123456789";

type Raw = string;

function makeSheet() {
  const grid: Raw[][] = [];
  const shown = (raw: Raw | undefined) => (raw === undefined ? "" : raw.startsWith("'") ? raw.slice(1) : raw);
  const cell = (row: number, col: number, value: Raw) => {
    (grid[row - 1] ??= [])[col - 1] = value;
  };
  const sheet = {
    grid,
    frozen: 0,
    getLastRow: () => grid.length,
    getLastColumn: () => grid.reduce((max, row) => Math.max(max, row.length), 0),
    getRange: (row: number, col: number, rows = 1, cols = 1) => {
      const range = {
        setValues(values: Raw[][]) {
          values.forEach((line, i) => line.forEach((value, j) => cell(row + i, col + j, value)));
          return range;
        },
        setValue(value: Raw) {
          cell(row, col, value);
          return range;
        },
        getValues: () =>
          Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => shown(grid[row - 1 + i]?.[col - 1 + j]))),
        getValue: () => shown(grid[row - 1]?.[col - 1]),
        setFontWeight: () => range,
      };
      return range;
    },
    appendRow(values: Raw[]) {
      grid.push([...values]);
    },
    setFrozenRows(count: number) {
      sheet.frozen = count;
    },
    /** Every cell a spreadsheet would run as a formula. */
    formulas() {
      return grid.flatMap((line, r) => line.flatMap((value, c) => (value?.startsWith("=") ? [[r + 1, c + 1, value]] : [])));
    },
  };
  return sheet;
}

type FakeSheet = ReturnType<typeof makeSheet>;
type Reply = { ok: boolean; error?: string; updated?: boolean };

let tabs: Record<string, FakeSheet>;
let doPost: (e: { postData: { contents: string } }) => Reply;

beforeEach(() => {
  tabs = {};
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => (key === "TOKEN" ? TOKEN : null) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getSheetByName: (name: string) => tabs[name] ?? null,
        insertSheet: (name: string) => (tabs[name] = makeSheet()),
      }),
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text: string) => ({ setMimeType: () => JSON.parse(text) as Reply }),
    },
  });
  vm.runInContext(SCRIPT, context);
  doPost = context.doPost as typeof doPost;
});

const post = (body: unknown) => doPost({ postData: { contents: JSON.stringify(body) } });

const row = (over: Record<string, string> = {}) => ({
  "Received (IST)": "2026-09-26 21:41:05",
  Reference: "IE-7K3QX2",
  Form: "Popup",
  Language: "English",
  Name: '=HYPERLINK("http://example.invalid","click")',
  Phone: "+919123456780",
  Email: "",
  "PIN code": "560001",
  Property: "Home",
  "Monthly bill": "₹2,500–4,000",
  "Sanctioned load (kW)": "",
  "Estimated system (kWp)": "3",
  "WhatsApp OK": "Yes",
  Source: "@instagram",
  Medium: "-social",
  Campaign: "\tbio",
  "Landing page": "/en",
  "Enquiry page": "/en",
  ...over,
});

function leads(): FakeSheet {
  const sheet = tabs.Leads;
  if (!sheet) throw new Error("no Leads tab");
  return sheet;
}
const column = (name: string) => leads().grid[0].indexOf(name);

describe("the lead register script", () => {
  it("touches nothing without the right token", () => {
    expect(post({ token: "wrong", action: "append", row: row() })).toEqual({ ok: false, error: "unauthorized" });
    expect(post({ action: "append", row: row() })).toEqual({ ok: false, error: "unauthorized" });
    expect(doPost({ postData: { contents: "not json" } })).toEqual({ ok: false, error: "bad-json" });
    expect(tabs.Leads).toBeUndefined();
  });

  it("creates the header row the website expects, then appends the enquiry as New", () => {
    expect(post({ token: TOKEN, action: "append", row: row() })).toEqual({ ok: true, updated: false });
    expect(leads().grid[0]).toEqual([...SHEET_COLUMNS]);
    expect(leads().frozen).toBe(1);
    expect(leads().grid).toHaveLength(2);
    expect(leads().grid[1][column("Status")]).toBe("New");
  });

  it("never writes a formula: = + - @ and a leading tab all become text", () => {
    post({ token: TOKEN, action: "append", row: row() });
    const written = leads().grid[1];
    expect(written[column("Phone")]).toBe("'+919123456780");
    expect(written[column("Name")]).toBe(`'${row().Name}`);
    expect(written[column("Source")]).toBe("'@instagram");
    expect(written[column("Medium")]).toBe("'-social");
    expect(written[column("Campaign")]).toBe("'\tbio");
    expect(leads().formulas()).toEqual([]);
  });

  it("leaves Status and Notes to the team, even if a request carries them", () => {
    post({ token: TOKEN, action: "append", row: { ...row(), Status: "Won", Notes: "=1+1" } });
    expect(leads().grid[1][column("Status")]).toBe("New");
    expect(leads().grid[1][column("Notes")]).toBe("");
  });

  it("updates a repeated reference in place, without touching the team's cells", () => {
    post({ token: TOKEN, action: "append", row: row() });
    const sheet = leads();
    sheet.grid[1][column("Status")] = "Contacted";
    sheet.grid[1][column("Notes")] = "'=called twice"; // typed as text by the team
    sheet.grid[0].push("Owner");
    sheet.grid[1][SHEET_COLUMNS.length] = "=VLOOKUP(B2,Staff!A:B,2)"; // the team's own formula

    expect(post({ token: TOKEN, action: "append", row: row({ Name: "Asha Rao" }) })).toEqual({ ok: true, updated: true });
    expect(sheet.grid).toHaveLength(2);
    expect(sheet.grid[1][column("Name")]).toBe("Asha Rao");
    expect(sheet.grid[1][column("Status")]).toBe("Contacted");
    expect(sheet.grid[1][column("Notes")]).toBe("'=called twice");
    expect(sheet.formulas()).toEqual([[2, SHEET_COLUMNS.length + 1, "=VLOOKUP(B2,Staff!A:B,2)"]]);
  });

  it("fills the Email of the row with the same reference, once", () => {
    post({ token: TOKEN, action: "append", row: row() });
    const email = { token: TOKEN, action: "email", reference: "IE-7K3QX2" };
    expect(post({ ...email, email: "asha@example.com" })).toEqual({ ok: true });
    expect(leads().grid[1][column("Email")]).toBe("asha@example.com");
    expect(post({ ...email, email: "asha@example.com" })).toEqual({ ok: true });
    expect(post({ ...email, email: "someone-else@example.com" })).toEqual({ ok: false, error: "email-set" });
    expect(post({ ...email, reference: "IE-AAAAAA", email: "a@example.com" })).toEqual({ ok: false, error: "not-found" });
  });

  it("refuses a reference the website would never mint", () => {
    expect(post({ token: TOKEN, action: "append", row: row({ Reference: "=1+1" }) })).toEqual({ ok: false, error: "bad-reference" });
    expect(post({ token: TOKEN, action: "email", reference: "=1+1", email: "a@example.com" })).toEqual({
      ok: false,
      error: "bad-reference",
    });
  });

  it("adds a second enquiry below the first", () => {
    post({ token: TOKEN, action: "append", row: row() });
    expect(post({ token: TOKEN, action: "append", row: row({ Reference: "IE-9ZZZZ2", Name: "Ravi" }) })).toEqual({
      ok: true,
      updated: false,
    });
    expect(leads().grid).toHaveLength(3);
    expect(leads().grid[2][column("Reference")]).toBe("IE-9ZZZZ2");
    expect(leads().grid[2][column("Status")]).toBe("New");
  });
});
