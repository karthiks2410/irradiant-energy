/**
 * Content and constants check (architecture.md §5.4).
 *
 *   npm run check:content            lists every engine constant that is not `official`
 *   npm run check:content -- --launch  exits non-zero while any constant that feeds a
 *                                      rendered money figure is still `to-confirm`
 *
 * Why this exists: the calculator prints rupee figures on / and /get-quote from constants
 * whose own `status` says the owner has not confirmed them (OD-10; decisions.md D-009 forbids
 * showing unverified facts). Nothing in the build, the type system or the test suite notices,
 * so "confirm the constants before the domain goes live" was a thing to remember rather than a
 * gate. `--launch` is that gate: run it in the cutover checklist, alongside setting
 * NEXT_PUBLIC_SITE_URL.
 *
 * Node 24 runs TypeScript directly, so there is no build step.
 */

import {
  BESCOM_DOMESTIC_SLABS,
  ENGINE_CONSTANTS,
  INSTALL_COST_PER_KWP,
  ROOF_SQFT_PER_KWP,
  SPECIFIC_YIELD,
  type EngineConstant,
} from "../src/lib/solar/constants.ts";

/**
 * The constants behind a figure the visitor reads as money or as a commitment: the tariff
 * (savings), the yield (generation, and through it the system size), the installed cost and the
 * roof area per kWp (which caps the size, and so the cost). A `to-confirm` value here is a
 * number the business has not stood behind.
 */
const MONEY_CRITICAL: readonly EngineConstant<unknown>[] = [
  BESCOM_DOMESTIC_SLABS,
  SPECIFIC_YIELD,
  INSTALL_COST_PER_KWP,
  ROOF_SQFT_PER_KWP,
];

const launch = process.argv.includes("--launch");

const unofficial = ENGINE_CONSTANTS.filter((c) => c.status !== "official");
console.log(`Engine constants: ${ENGINE_CONSTANTS.length} total, ${unofficial.length} not yet official.\n`);
for (const c of unofficial) {
  console.log(`  [${c.status}] ${c.id} — ${c.label}`);
  console.log(`      source: ${c.source}`);
}

if (!launch) {
  console.log("\nRun with --launch to fail on anything that blocks going live.");
  process.exit(0);
}

const blocking = MONEY_CRITICAL.filter((c) => c.status === "to-confirm");
const accepted = MONEY_CRITICAL.filter((c) => c.status === "owner-accepted");
if (accepted.length) {
  console.log(
    `\nNOTE: ${accepted.length} money constant(s) are owner-accepted legacy values, not verified figures:\n` +
      accepted.map((c) => `  - ${c.id} (${c.label}): ${JSON.stringify(c.value)} ${c.unit ?? ""}`).join("\n") +
      "\nThey do not block launch. Revisit them when the real pricing is confirmed.",
  );
}
if (blocking.length === 0) {
  console.log("\nLaunch gate: every constant behind a rendered money figure is confirmed.");
  process.exit(0);
}

console.error(
  `\nLAUNCH GATE FAILED: ${blocking.length} constant(s) behind rendered money figures are still "to-confirm".\n` +
    "Get the owner's sign-off (OD-10: the current KERC/BESCOM LT-2(a) schedule, per-segment\n" +
    "installed cost for residential / society / commercial, and the specific yield used in real\n" +
    "proposals), then change each `status` in src/lib/solar/constants.ts.\n",
);
for (const c of blocking) console.error(`  - ${c.id} (${c.label}): ${JSON.stringify(c.value)}${c.unit ? ` ${c.unit}` : ""}`);
process.exit(1);
