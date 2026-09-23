import { Accent, AccentRun } from "@/components/ui";
import { splitOnAccent } from "@/components/ui/accent-split";

/**
 * The brand's two-tone headline: the closing phrase of a section title renders in the
 * accent green (brand PDF p.24). The split is computed from the content string rather
 * than hard-coded here, so a copy edit in src/content cannot leave a stale fragment
 * behind on the page. Display and H2 sizes only — <Accent> is not legible below them.
 *
 * `accent` overrides that rule with an explicit substring. Deriving emphasis from word position
 * only works in a language whose emphasised phrase lands last: Kannada puts the verb there, so
 * the last-N-words rule paints the verb green and leaves the noun phrase in ink
 * (layout-risks.md M9). Kannada copy therefore carries its own accent. English passes nothing and
 * takes the branch below unchanged — its rendered output is identical to before this prop existed.
 */
export function AccentTitle({ text, words = 2, accent }: { text: string; words?: number; accent?: string }) {
  const explicit = splitOnAccent(text, accent);
  if (explicit) return <AccentRun split={explicit} />;

  const parts = text.split(" ");
  if (parts.length <= words) return <Accent>{text}</Accent>;
  return (
    <>
      {parts.slice(0, -words).join(" ")} <Accent>{parts.slice(-words).join(" ")}</Accent>
    </>
  );
}
