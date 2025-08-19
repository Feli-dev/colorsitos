import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import { routing } from "@/i18n/routing";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

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
      <body
        className={`${GeistSans.className} ${GeistMono.className} ${spaceGrotesk.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <div className="cursor-pointer fixed top-3 right-3 z-50 flex items-center justify-center size-10 border-2 rounded-lg">
            <AnimatedThemeToggler className="cursor-pointer" />
          </div>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
