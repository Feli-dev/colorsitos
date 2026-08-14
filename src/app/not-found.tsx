import Link from "next/link";
import "./globals.css";

/**
 * Root-level 404 fallback.
 *
 * Two reasons this exists alongside [locale]/not-found.tsx:
 *
 * 1. `notFound()` in [locale]/layout.tsx throws while that layout is still
 *    rendering, so its own not-found boundary cannot catch it. The error
 *    escalates to the parent — this file.
 * 2. src/app/layout.tsx returns bare `children` with no <html> element, so
 *    whatever renders here has to supply the document shell itself.
 *
 * It is also outside NextIntlClientProvider and ThemeProvider, so there is no
 * translation context and no theme class: the copy is the default locale's and
 * the page renders in light tokens. That is acceptable for a shell that only
 * appears for an unsupported locale, and it is why the copy is inlined rather
 * than read from a message file.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-mono text-sm text-neutral-500">404</p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Page not found
          </h1>
          <p className="max-w-md text-neutral-500">
            That page does not exist, or it moved somewhere else.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 transition-colors hover:bg-neutral-700"
          >
            Back to the generator
          </Link>
        </main>
      </body>
    </html>
  );
}
