import { DynamicFavicon } from "@/components/dynamic-favicon";
import { Footer } from "@/components/footer";
import { AnimatedThemeToggler } from "@/components/magicui/animated-theme-toggler";
import SupportButton from "@/components/support-button";
import { routing } from "@/i18n/routing";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
    ? "https://colorsitos.vercel.app"
    : "http://localhost:3000";

  const title = t("title");
  const description = t("description");
  const keywords = t("keywords");

  return {
    title,
    description,
    keywords,
    authors: [{ name: "Colorsitos Team" }],
    creator: "Colorsitos",
    publisher: "Colorsitos",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        es: "/es",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: locale,
      url: `${baseUrl}/${locale}`,
      title,
      description,
      siteName: "Colorsitos",
      images: [
        {
          url: "/og-image.png",
          width: 1300,
          height: 311,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: "@colorsitos",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

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
        className={`${GeistSans.className} ${GeistMono.className} ${spaceGrotesk.variable} antialiased
          bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900
          min-h-screen
          `}
      >
        <NextIntlClientProvider>
          <DynamicFavicon />
          <div className="cursor-pointer fixed top-3 right-3 z-50 flex items-center justify-center size-10 border-2 rounded-lg">
            <AnimatedThemeToggler className="cursor-pointer" />
          </div>
          {children}
          <SupportButton />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
