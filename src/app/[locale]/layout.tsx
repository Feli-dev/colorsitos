import { DynamicFavicon } from "@/components/dynamic-favicon";
import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { SupportButton } from "@/components/support-button";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
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
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${GeistSans.className} ${GeistMono.className} ${spaceGrotesk.variable} antialiased
          bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900
          min-h-screen
          `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="colorsitos-theme"
        >
          <NextIntlClientProvider>
            <DynamicFavicon />
            <Navbar />
            {children}
            <SupportButton />
            <Footer />
            <Toaster
              position="bottom-left"
              expand={true}
              toastOptions={{
                classNames: {
                  toast:
                    "!shadow-none !bg-card !text-card-foreground !rounded-lg !w-fit !px-4 !py-2",
                  title: "!text-foreground font-medium !text-base",
                  description: "!text-muted-foreground font-mono !text-sm",
                },
              }}
            />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
