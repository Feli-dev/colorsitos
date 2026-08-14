import { DynamicFavicon } from "@/components/dynamic-favicon";
import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/layout/navbar";
import { SupportButton } from "@/components/support-button";
import { Toaster } from "@/components/ui/sonner";
import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/utils/site-url";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "../globals.css";

/**
 * Space Grotesk font configuration with specified weights and subsets.
 * Used as the primary font for the application with CSS variable assignment.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Generates dynamic metadata for the application based on the current locale.
 * This includes SEO metadata, Open Graph tags, Twitter cards, and other
 * metadata required for proper social media sharing and search engine optimization.
 *
 * @param params - Route parameters containing the current locale
 * @param params.locale - The locale string (e.g., 'en', 'es')
 * @returns Promise resolving to Next.js Metadata object with all necessary meta tags
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const baseUrl = getSiteUrl();

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

/**
 * Main layout component for localized pages. Handles locale validation,
 * provides internationalization context, theme management, and renders
 * the core application structure including navigation, footer, and global UI elements.
 *
 * @param props - Component props
 * @param props.children - Child components to render within the layout
 * @param props.params - Route parameters containing the current locale
 * @param props.params.locale - The locale string for the current page
 * @returns The complete page layout with all providers and UI components
 */
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
        className={`${spaceGrotesk.className} ${GeistMono.className} antialiased
          bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-950 dark:to-neutral-900
          min-h-screen max-w-screen overflow-x-hidden
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
            <NuqsAdapter>
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
            </NuqsAdapter>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
