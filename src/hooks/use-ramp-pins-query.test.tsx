import { act, renderHook, waitFor } from "@testing-library/react";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";

import { useRampPinsQuery } from "./use-ramp-pins-query";

/**
 * Sibling hook to `use-color-query.ts` (verify with
 * `git diff --stat src/hooks/use-color-query.ts` -- must be empty). Pins
 * live in five entirely separate query params, one per `PinnableRole`, so a
 * legacy `?color=X` URL never touches them (R1, top risk).
 */
function renderWithSearch(
  search: string,
  onUrlUpdate?: (e: UrlUpdateEvent) => void
) {
  return renderHook(() => useRampPinsQuery(), {
    wrapper: ({ children }) => (
      <NuqsTestingAdapter searchParams={search} onUrlUpdate={onUrlUpdate}>
        {children}
      </NuqsTestingAdapter>
    ),
  });
}

describe("useRampPinsQuery — legacy URL back-compat (R1, top risk)", () => {
  it("a legacy ?color=X URL alone yields {} pins -- pins live in different param names", () => {
    const { result } = renderWithSearch("?color=3182ce");
    const [pins] = result.current;
    expect(pins).toEqual({});
  });

  it("no query string at all also yields {} pins", () => {
    const { result } = renderWithSearch("");
    const [pins] = result.current;
    expect(pins).toEqual({});
  });
});

describe("useRampPinsQuery — reading pins from the URL", () => {
  it("reads a valid pinned hex for a single role", () => {
    const { result } = renderWithSearch("?accent=00ff00");
    const [pins] = result.current;
    expect(pins.accent).toBe("#00ff00");
    expect(pins.danger).toBeUndefined();
  });

  it("reads multiple pinned roles independently", () => {
    const { result } = renderWithSearch("?accent=00ff00&danger=ff0000");
    const [pins] = result.current;
    expect(pins).toEqual({ accent: "#00ff00", danger: "#ff0000" });
  });

  it("rejects a malformed hex without throwing (isValidHex guard)", () => {
    const { result } = renderWithSearch("?danger=not-a-hex");
    const [pins] = result.current;
    expect(pins.danger).toBeUndefined();
    expect(pins).toEqual({});
  });
});

describe("useRampPinsQuery — writing pins", () => {
  it("setPin writes only the target role's param, leaving color untouched", async () => {
    const updates: UrlUpdateEvent[] = [];
    const { result } = renderWithSearch("?color=3182ce", (e) => updates.push(e));

    await act(async () => {
      const [, setPin] = result.current;
      await setPin("neutral", "#808080");
    });

    await waitFor(() => {
      expect(updates.at(-1)?.searchParams.get("neutral")).toBe("808080");
    });
    expect(updates.at(-1)?.searchParams.get("color")).toBe("3182ce");
  });

  it("setPin(role, null) clears that role's param", async () => {
    const updates: UrlUpdateEvent[] = [];
    const { result } = renderWithSearch("?accent=00ff00", (e) => updates.push(e));

    await act(async () => {
      const [, setPin] = result.current;
      await setPin("accent", null);
    });

    await waitFor(() => {
      expect(updates.at(-1)?.searchParams.get("accent")).toBeNull();
    });
  });
});
