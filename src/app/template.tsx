import type { ReactNode } from "react";
import { RouteTransition } from "@/components/motion/RouteTransition";

/**
 * Wraps every route so page changes cross-fade instead of cutting (owner review 2, point 2).
 *
 * This file affects all routes. It stays a Server Component: `children` is the server-rendered page,
 * passed straight through to a client island, so nothing on any page becomes client-side.
 *
 * Why a template rather than React's <ViewTransition>: Next 16.3.5 does ship it — the bundled guide
 * at node_modules/next/dist/docs/01-app/02-guides/view-transitions.md says it needs no configuration,
 * and the vendored React exports it — but the same guide says the wrapper has to go in every
 * page.tsx ("Put the wrapper in each page.tsx, not the layout"), the header needs a
 * `viewTransitionName` plus matching CSS, and the app's own react@19.2.8 and @types/react ship it
 * only behind the experimental entry point, so `import { ViewTransition } from "react"` does not
 * typecheck here. One template is a much smaller surface for the same result. Worth revisiting if
 * a shared-element morph is ever wanted.
 *
 * The extra wrapper element is layout-neutral: it has no padding or border, so the home hero's
 * `-mt-(--header-h)` still collapses through it to <main> exactly as before.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
