import { afterEach, describe, expect, it, vi } from "vitest";

import { getSiteUrl } from "./site-url";

// vi.stubEnv rather than assigning process.env directly: NODE_ENV is typed
// read-only, and stubbing restores cleanly between tests.
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getSiteUrl", () => {
  it("falls back to localhost outside production", () => {
    vi.stubEnv("VERCEL_URL", undefined);
    vi.stubEnv("NODE_ENV", "development");

    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("falls back to the known production domain in production", () => {
    vi.stubEnv("VERCEL_URL", undefined);
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).toBe("https://colorsitos.vercel.app");
  });

  it("returns an absolute https URL with no trailing slash", () => {
    vi.stubEnv("VERCEL_URL", undefined);
    vi.stubEnv("NODE_ENV", "production");

    const url = getSiteUrl();
    expect(url).toMatch(/^https:\/\//);
    expect(url.endsWith("/")).toBe(false);
  });

  // Documents today's behaviour, which the next change corrects: VERCEL_URL is
  // the per-deployment hostname, so canonical links built from it point at a
  // preview deployment rather than the production domain.
  it("currently prefers VERCEL_URL, the per-deployment hostname", () => {
    vi.stubEnv("VERCEL_URL", "colorsitos-git-abc123-felidev.vercel.app");
    vi.stubEnv("NODE_ENV", "production");

    expect(getSiteUrl()).toBe(
      "https://colorsitos-git-abc123-felidev.vercel.app"
    );
  });
});
