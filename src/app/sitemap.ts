import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/utils/site-url";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  // Locales come from the routing config rather than a second hardcoded list,
  // so adding one does not silently leave it out of the sitemap.
  return routing.locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    changeFrequency: "weekly" as const,
    priority: locale === routing.defaultLocale ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((alt) => [alt, `${baseUrl}/${alt}`])
      ),
    },
  }));
}
