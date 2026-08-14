/**
 * Absolute base URL for the deployed site, used for canonical links, Open Graph
 * URLs, robots.txt and the sitemap.
 *
 * NOTE: this is lifted verbatim out of src/app/[locale]/layout.tsx so that every
 * caller reads one implementation. It carries that file's existing bug — see the
 * comment inside — which the next change fixes in this single place instead of
 * three.
 */
export function getSiteUrl(): string {
  // BUG, fixed in the following change: VERCEL_URL is the per-deployment
  // hostname, unique to each build, not the production domain. Canonicals and
  // Open Graph URLs built from it point at ephemeral preview deployments.
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
    ? "https://colorsitos.vercel.app"
    : "http://localhost:3000";
}
