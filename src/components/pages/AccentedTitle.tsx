import { Accent } from "@/components/ui";
import { splitOnAccent } from "@/components/ui/accent-split";

/**
 * The brand's two-tone headline: the trailing phrase turns green (report §6.4, display sizes only).
 * The accent is derived from the source string rather than re-typed, so page copy cannot drift
 * from src/content/*.
 *
 * `accent` names the emphasised run outright. A trailing-word rule is an English assumption: in
 * Kannada the verb is last and the phrase worth emphasising is usually first, and because Kannada
 * compounds, `tail = 2` can swallow a whole headline (layout-risks.md M9). English passes nothing
 * and keeps the branch below exactly as it was.
 */
export function AccentedTitle({ text, tail = 1, accent }: { text: string; tail?: number; accent?: string }) {
  const explicit = splitOnAccent(text, accent);
  if (explicit) {
    return (
      <>
        {explicit.before}
        <Accent>{explicit.accent}</Accent>
        {explicit.after}
      </>
    );
  }

  const words = text.split(" ");
  if (words.length <= tail) return <Accent>{text}</Accent>;
  return (
    <>
      {words.slice(0, -tail).join(" ")} <Accent>{words.slice(-tail).join(" ")}</Accent>
    </>
  );
}
