import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "./site-url";

// vi.stubEnv rather than assigning process.env directly: NODE_ENV is typed
// read-only, and stubbing restores cleanly between tests.
afterEach(() => {
  vi.unstubAllEnvs();
});

const clearVercelEnv = () => {
  vi.stubEnv("VERCEL_URL", undefined);
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", undefined);
};

describe("getSiteUrl", () => {
  it("falls back to localhost outside production", () => {
    clearVercelEnv();
    vi.stubEnv("NODE_ENV", "development");

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("falls back to the known production domain in production", () => {
    clearVercelEnv();
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).toBe("https://www.colorsitos.app");
  });

  it("returns an absolute https URL with no trailing slash", () => {
    clearVercelEnv();
    vi.stubEnv("NODE_ENV", "production");

    const url = getSiteUrl();
    expect(url).toMatch(/^https:\/\//);
    expect(url.endsWith("/")).toBe(false);
  });

  it("uses the project's production domain when Vercel provides it", () => {
    clearVercelEnv();
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "www.colorsitos.app");
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).toBe("https://www.colorsitos.app");
  });

  /**
   * The regression this guards. VERCEL_URL is the per-deployment hostname, so
   * canonical and Open Graph URLs built from it name an ephemeral preview
   * instead of the real page. It must be ignored even when it is the only
   * Vercel variable set.
   */
  it("ignores VERCEL_URL, the per-deployment hostname", () => {
    clearVercelEnv();
    vi.stubEnv("VERCEL_URL", "colorsitos-git-abc123-felidev.vercel.app");
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).not.toContain("abc123");
    expect(getSiteUrl()).toBe("https://www.colorsitos.app");
  });

  it("prefers the production domain over the deployment hostname", () => {
    clearVercelEnv();
    vi.stubEnv("VERCEL_URL", "colorsitos-git-abc123-felidev.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "www.colorsitos.app");
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).toBe("https://www.colorsitos.app");
  });

  it("reports the production domain even on a preview deployment", () => {
    // Intended: a canonical should always name the canonical page, not the
    // preview it happens to be rendered on.
    clearVercelEnv();
    vi.stubEnv("VERCEL_URL", "colorsitos-git-feature-felidev.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "www.colorsitos.app");
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(getSiteUrl()).toBe("https://www.colorsitos.app");
  });
});
