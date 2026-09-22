/* eslint-disable @next/next/no-html-link-for-pages -- Plain anchors are mandatory here: Next skips
   rendering for this file, so there is no client router to hand a <Link> to and no app shell to
   soft-navigate from. Every link out of this page has to be a document load. */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LogoLockup } from "@/components/brand/Logo";
import "./globals.css";

/**
 * The 404 for URLs that match no route at all.
 *
 * It exists because the root layout now sits under the `[lang]` dynamic segment: there is no
 * single layout Next can compose a normal `not-found.tsx` from, and without this file such a URL
 * gets Next's unstyled default page. Next skips rendering entirely and returns this, so it has to
 * bring its own `<html>`, its own stylesheet and its own font
 * (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md).
 *
 * Deliberately pathname-free: this page is prerendered at `/_not-found` and served at whatever URL
 * was asked for, so anything rendered from `usePathname()` would differ between the server and the
 * client and hydrate with React error #418. That is why it draws its own minimal header instead of
 * mounting <SiteHeader>, whose HeaderShell and NavLinkItem both read the pathname.
 *
 * Plex Mono is left out on purpose — the docs recommend a smaller set of global styles and a
 * simpler font family here, and the eyebrow falls back to the sans stack.
 */
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Page not found | Irradiant Energy",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <header data-surface="dark" className="bg-teal-900 text-white">
          <div className="container-page flex min-h-(--header-h) items-center">
            <a href="/en" className="shrink-0">
              <LogoLockup className="h-[42px] w-auto lg:h-12" />
            </a>
          </div>
        </header>

        <main className="flex-1">
          <section className="container-page section-y">
            <div className="max-w-2xl">
              <p className="flex items-center gap-3 text-eyebrow font-medium text-green-700 uppercase">
                <span aria-hidden="true" className="h-px w-8 bg-green-700" />
                Error 404
              </p>
              <h1 className="mt-4 font-display text-h2 font-extrabold text-carbon">We can&rsquo;t find that page.</h1>
              <p className="mt-4 text-lead text-ink-2">
                The link may be out of date, or the page may have moved while the site was being rebuilt.
              </p>
              {/* Rendered from the system Kannada stack: no webfont is loaded on this page. */}
              <p lang="kn" className="mt-2 text-lead text-ink-2">
                ಈ ಪುಟ ಸಿಗಲಿಲ್ಲ.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/en"
                  className="inline-flex min-h-11 items-center rounded-full bg-green-700 px-5 py-2.5 font-sans text-ui font-semibold text-white transition-colors duration-200 hover:bg-teal-900"
                >
                  Go to the home page
                </a>
                <a
                  href="/kn"
                  lang="kn"
                  hrefLang="kn-IN"
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-teal-900 px-5 py-2.5 font-sans text-ui font-semibold text-teal-900 transition-colors duration-200 hover:bg-teal-900 hover:text-white"
                >
                  ಕನ್ನಡ
                </a>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
