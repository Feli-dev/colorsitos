/**
 * Absolute base URL for the deployed site, used for canonical links, Open Graph
 * URLs, robots.txt and the sitemap.
 *
 * Prefers VERCEL_PROJECT_PRODUCTION_URL, which is the project's production
 * domain and is exposed on every deployment including previews.
 *
 * It deliberately does NOT use VERCEL_URL. That is the per-deployment hostname,
 * unique to each build (colorsitos-git-abc123-felidev.vercel.app), so a canonical
 * or Open Graph URL built from it points at an ephemeral preview rather than the
 * real page — which is the opposite of what a canonical is for.
 *
 * Consequence worth knowing: a preview deployment reports the production base
 * URL. That is intended. Canonicals should always name the canonical page.
 */
export function getSiteUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.NODE_ENV === "production"
    ? "https://colorsitos.vercel.app"
    : "http://localhost:3000";
}
