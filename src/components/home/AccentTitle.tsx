import { Accent } from "@/components/ui";

/**
 * The brand's two-tone headline: the closing phrase of a section title renders in the
 * accent green (brand PDF p.24). The split is computed from the content string rather
 * than hard-coded here, so a copy edit in src/content cannot leave a stale fragment
 * behind on the page. Display and H2 sizes only — <Accent> is not legible below them.
 */
export function AccentTitle({ text, words = 2 }: { text: string; words?: number }) {
  const parts = text.split(" ");
  if (parts.length <= words) return <Accent>{text}</Accent>;
  return (
    <>
      {parts.slice(0, -words).join(" ")} <Accent>{parts.slice(-words).join(" ")}</Accent>
    </>
  );
}
