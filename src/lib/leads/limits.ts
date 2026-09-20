/**
 * Field lengths for the lead form, with no dependencies.
 *
 * The server schema (src/lib/leads/schema.ts) enforces these and the client form uses them for
 * `maxLength`. They live in their own module so the client can import them without pulling zod
 * into the browser bundle, and so the two sides cannot drift apart.
 */

export const NAME_MAX = 80;
export const EMAIL_MAX = 120;
export const MESSAGE_MAX = 500;

/** Upper bound for the calculator's roof-area figure; beyond this the value is ignored. */
export const ROOF_AREA_MAX_SQFT = 10_000_000;
