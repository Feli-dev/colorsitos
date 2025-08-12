import { routing } from "@/i18n/routing";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Colorsitos",
  description: "Colorsitos",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var stored = localStorage.getItem('theme');
    var mql = window.matchMedia('(prefers-color-scheme: dark)');
    var systemDark = mql.matches;
    var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var willDark = theme === 'dark' || (theme === 'system' && systemDark);
    var html = document.documentElement;
    html.classList.toggle('dark', willDark);
    html.style.colorScheme = willDark ? 'dark' : 'light';
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body
        className={`${GeistSans.className} ${GeistMono.className} antialiased`}
      >
        <ThemeProvider>
          <NextIntlClientProvider>
            <div className="fixed top-3 right-3 z-50">
              <ThemeToggle />
            </div>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
