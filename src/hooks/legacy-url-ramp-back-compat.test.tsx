import { renderHook } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";

import { generateColorPalette } from "@/utils/palette-generator";
import { buildRampSet } from "@/utils/ramps/build-ramp-set";
import { useRampPinsQuery } from "./use-ramp-pins-query";

/**
 * R1, the highest-ranked risk in the whole plan: a legacy `?color=X` link
 * must render brand-ramp output byte-identical to `main`, forever, AND every
 * other ramp must genuinely derive from `X` -- never silently default to a
 * fixed or wrong value that would mask broken wiring as "it still renders
 * something". This is the end-to-end proof combining `useRampPinsQuery`
 * (Slice 8) and `buildRampSet` (Slice 6): the whole pipeline a future UI
 * consumer will use.
 */
function pinsFromLegacyUrl(search: string) {
  const { result } = renderHook(() => useRampPinsQuery(), {
    wrapper: ({ children }) => (
      <NuqsTestingAdapter searchParams={search}>{children}</NuqsTestingAdapter>
    ),
  });
  return result.current[0];
}

const PINNABLE_ROLES = ["neutral", "accent", "success", "warning", "danger"] as const;

describe("Legacy URL back-compat (R1, blocking)", () => {
  const BRAND_HEX = "#3182CE";

  it("?color=X alone: brand ramp is byte-identical to a fresh generation, no pins involved", () => {
    const pins = pinsFromLegacyUrl(`?color=${BRAND_HEX.slice(1)}`);
    expect(pins).toEqual({});

    const rampSet = buildRampSet(BRAND_HEX, pins);

    expect(rampSet.brand.baseHex).toBe(BRAND_HEX);
    expect(rampSet.brand.shades).toEqual(generateColorPalette(BRAND_HEX));
    expect(rampSet.brand.origin).toBe("brand");
  });

  it("?color=X alone: every other ramp is genuinely derived, matching the no-pins ground truth", () => {
    const pins = pinsFromLegacyUrl(`?color=${BRAND_HEX.slice(1)}`);
    const rampSet = buildRampSet(BRAND_HEX, pins);
    const groundTruth = buildRampSet(BRAND_HEX); // no pins, no URL involved at all

    for (const role of PINNABLE_ROLES) {
      expect(rampSet[role].origin).toBe("derived");
      expect(rampSet[role].baseHex).toBe(groundTruth[role].baseHex);
      expect(rampSet[role].shades).toEqual(groundTruth[role].shades);
    }
  });

  it("a different legacy brand hex produces different derived ramps -- proves derivation, not a hardcoded default", () => {
    const pinsA = pinsFromLegacyUrl("?color=3182ce");
    const pinsB = pinsFromLegacyUrl("?color=e53e3e");

    const rampSetA = buildRampSet("#3182CE", pinsA);
    const rampSetB = buildRampSet("#E53E3E", pinsB);

    for (const role of PINNABLE_ROLES) {
      expect(rampSetB[role].baseHex).not.toBe(rampSetA[role].baseHex);
    }
  });
});
