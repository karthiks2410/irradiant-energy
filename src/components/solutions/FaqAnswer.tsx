import { Fragment } from "react";

/**
 * Renders a content answer string (src/content/types.ts `Faq.a`): blank lines separate
 * paragraphs, lines starting with "• " are bullets and lines starting with "1. " are numbered
 * steps. Consecutive list lines join into one list. Server-rendered, so the answer is in the
 * HTML that the FAQ structured data mirrors.
 */

type Block = { kind: "p"; text: string } | { kind: "ul" | "ol"; items: string[] };

const BULLET = /^•\s+/;
const NUMBER = /^\d+[.)]\s+/;

function parseAnswer(answer: string): Block[] {
  const blocks: Block[] = [];

  for (const raw of answer.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;

    const kind = BULLET.test(line) ? "ul" : NUMBER.test(line) ? "ol" : "p";
    if (kind === "p") {
      blocks.push({ kind, text: line });
      continue;
    }

    const item = line.replace(kind === "ul" ? BULLET : NUMBER, "");
    const previous = blocks.at(-1);
    if (previous && previous.kind === kind) previous.items.push(item);
    else blocks.push({ kind, items: [item] });
  }

  return blocks;
}

export function FaqAnswer({ answer }: { answer: string }) {
  return (
    <div className="space-y-4">
      {parseAnswer(answer).map((block, index) => (
        <Fragment key={index}>
          {block.kind === "p" ? (
            <p>{block.text}</p>
          ) : block.kind === "ul" ? (
            <ul className="list-disc space-y-2 pl-5 marker:text-green-700 in-data-[surface=dark]:marker:text-green-300">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <ol className="list-decimal space-y-2 pl-5 marker:font-mono marker:text-green-700 in-data-[surface=dark]:marker:text-green-300">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )}
        </Fragment>
      ))}
    </div>
  );
}
