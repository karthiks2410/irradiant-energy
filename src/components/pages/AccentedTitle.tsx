import { Accent } from "@/components/ui";

/**
 * The brand's two-tone headline: the trailing phrase turns green (report §6.4, display sizes only).
 * The accent is derived from the source string rather than re-typed, so page copy cannot drift
 * from src/content/*.
 */
export function AccentedTitle({ text, tail = 1 }: { text: string; tail?: number }) {
  const words = text.split(" ");
  if (words.length <= tail) return <Accent>{text}</Accent>;
  return (
    <>
      {words.slice(0, -tail).join(" ")} <Accent>{words.slice(-tail).join(" ")}</Accent>
    </>
  );
}
