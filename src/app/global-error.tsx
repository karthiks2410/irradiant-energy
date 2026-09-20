"use client";

import { site } from "@/content/site";

/**
 * Root error boundary. `error.tsx` renders inside the root layout, so a failure in the layout
 * itself (or in anything it renders) falls past it to Next's unstyled built-in page. This file
 * replaces that page, so the worst case still looks like the business and still offers a way to
 * reach it (VERIFIED: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md,
 * "Global Error"; the Next 16 signature is `{ error, retry }`).
 *
 * It renders its own <html>/<body> and does not get globals.css or the site fonts, so the few
 * styles it needs are inline, with the brand values from globals.css written out literally.
 * The error object is not shown: production replaces its message with a digest, and the server
 * copy is already reported by src/instrumentation.ts.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const phone = site.contact.phonePrimary.value;
  const email = site.contact.email.value;

  return (
    <html lang="en-IN">
      <body style={{ margin: 0, backgroundColor: "#02342b", color: "#ffffff" }}>
        <title>{`Something went wrong — ${site.name}`}</title>
        <main
          style={{
            boxSizing: "border-box",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1.5rem",
            maxWidth: "40rem",
            margin: "0 auto",
            padding: "4rem 1.5rem",
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            lineHeight: 1.6,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.8125rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#ffcd00",
            }}
          >
            Something went wrong
          </p>
          <h1 style={{ margin: 0, fontSize: "2rem", lineHeight: 1.15, fontWeight: 800 }}>
            The site didn&rsquo;t load properly.
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.9)" }}>
            Please try again. If it keeps happening, call us on{" "}
            <a href={`tel:${phone.tel}`} style={{ color: "#ffffff", fontWeight: 600 }}>
              {phone.display}
            </a>{" "}
            or write to{" "}
            <a href={`mailto:${email}`} style={{ color: "#ffffff", fontWeight: 600 }}>
              {email}
            </a>
            .
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                minHeight: "2.75rem",
                padding: "0 1.5rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#ffffff",
                color: "#02342b",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* A plain anchor on purpose: the root tree is broken, so the way out is a full
                document load, not a client-side navigation into the same broken tree. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "2.75rem",
                padding: "0 1.5rem",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.5)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to the home page
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
