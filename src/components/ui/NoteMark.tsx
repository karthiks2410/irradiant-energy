/**
 * The small warning mark in front of a calculator note ("Capped by your sanctioned load"), so a
 * note reads as a caveat on the figures rather than as more body text (owner, 2026-09-25).
 *
 * Solar Yellow with a Deep Teal "!", which reads on the dark results panel and on the white home
 * calculator alike. Decorative: the note's words carry the meaning, so it is hidden from
 * assistive tech.
 */
export function NoteMark() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-yellow-400 font-sans text-[0.6875rem] leading-none font-extrabold text-teal-900"
    >
      !
    </span>
  );
}
