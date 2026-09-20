/**
 * Server error reporting (architecture.md §10.5).
 *
 * `onRequestError` fires whenever the Next.js server captures an error — a Server Component
 * render, a route handler or a Server Action — including the ones a route `error.tsx` swallows
 * on the client (VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md,
 * "onRequestError (optional)"). Without it the only record of a failed request is Next's own
 * stack trace in the runtime log.
 *
 * It writes one structured, PII-free line through the same allow-list discipline as the lead
 * log: path and method, error name and digest, never the message, the query string, headers,
 * cookies or the request body. When an error reporter is added (a Sentry project or a log
 * drain, OD-5), it is called from here and nothing else has to change.
 */

import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const digest =
    typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : undefined;

  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "error",
      event: "request_error",
      // The path only; a query string can carry whatever a visitor typed into a link.
      path: request.path.split("?")[0],
      method: request.method,
      errorName: err instanceof Error ? err.name : "unknown",
      digest,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
    }),
  );
};
