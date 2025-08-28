import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {};

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/manifest\.json$/],
  sw: "/sw.js",
};

const withNextIntl = createNextIntlPlugin();
export default withPWA(pwaConfig)(withNextIntl(nextConfig));
