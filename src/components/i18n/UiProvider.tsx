"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Ui } from "@/content/ui";

/**
 * The one way a client island reads chrome strings it cannot be handed as props.
 *
 * Almost every island in this app takes its copy as props from a Server Component, which is the
 * better route and stays the default (scripts/check-client-content.ts enforces that no client
 * module imports content). Two cases cannot:
 *
 * - `src/app/[lang]/error.tsx`. Next requires the route error boundary to be a Client Component
 *   and gives it exactly two props, `error` and `retry`. There is nowhere to pass strings in.
 *   It renders inside the layout (node_modules/next/dist/docs/01-app/03-api-reference/
 *   03-file-conventions/error.md: "It does not wrap the layout.js or template.js above it"), so
 *   the provider mounted there is always above it.
 * - the consent UI, which is mounted once in the layout but whose settings panel is rendered by
 *   `/cookies` — a page in a different part of the tree that would otherwise have to thread the
 *   same object through itself for a component it only borrows.
 *
 * Why this does not leak a language into the wrong bundle: the strings are not imported here.
 * They travel in the RSC payload of the page being rendered, which is built for one locale, and
 * the only thing this module imports from the content layer is a TYPE — erased before bundling.
 *
 * It carries a slice, not the whole `ui` object, so a page's payload gains the chrome an island
 * actually reads rather than the calculator's flag notes and the home page's labels as well.
 */
export interface ChromeUi {
  readonly error: Ui["error"];
  readonly consent: Ui["consent"];
}

const ChromeUiContext = createContext<ChromeUi | null>(null);

export function UiProvider({ value, children }: { value: ChromeUi; children: ReactNode }) {
  return <ChromeUiContext value={value}>{children}</ChromeUiContext>;
}

/**
 * Throws rather than falling back to English. A Kannada page that quietly renders one English
 * sentence is worse than a loud failure: the reader cannot tell which lines were translated and
 * which were forgotten (docs/kannada/research/architecture.md §6.4).
 */
export function useChromeUi(): ChromeUi {
  const value = useContext(ChromeUiContext);
  if (!value) throw new Error("useChromeUi: no <UiProvider> above this component");
  return value;
}
