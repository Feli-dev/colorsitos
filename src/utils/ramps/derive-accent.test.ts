import { describe, expect, it } from "vitest";

import { hexToRgb, rgbToHsl } from "../color-utils";
import {
  DEFAULT_HARMONY_RULE,
  deriveAccentBase,
  HARMONY_ROTATION,
  type HarmonyRule,
} from "./derive-accent";

/**
 * Harmony IS the feature for accent (design decision B' boundary: no naming
 * constraint, real hue rotations survive untouched). Hue tolerance below
 * accounts for the same documented hex round-trip quantization as
 * `derive-neutral.test.ts`/`derive-semantic.test.ts`.
 */
const HUE_TOLERANCE = 1;

function hueOf(hex: string): number {
  const rgb = hexToRgb(hex)!;
  return rgbToHsl(rgb.r, rgb.g, rgb.b).h;
}

describe("deriveAccentBase", () => {
  const brandHex = "#3182CE";
  const brandHue = hueOf(brandHex);

  it.each(Object.entries(HARMONY_ROTATION) as [HarmonyRule, number][])(
    "rotates hue by %s degrees for the %s rule",
    (rule, degrees) => {
      const result = deriveAccentBase(brandHex, rule);
      const resultHue = hueOf(result);
      const expectedHue = (brandHue + degrees) % 360;
      const diff = Math.min(
        Math.abs(resultHue - expectedHue),
        360 - Math.abs(resultHue - expectedHue)
      );
      expect(diff).toBeLessThan(HUE_TOLERANCE);
    }
  );

  it("defaults to DEFAULT_HARMONY_RULE when no rule is given", () => {
    const withDefault = deriveAccentBase(brandHex);
    const withExplicit = deriveAccentBase(brandHex, DEFAULT_HARMONY_RULE);
    expect(withDefault).toBe(withExplicit);
  });

  it("wraps the rotation past 360 degrees", () => {
    const highHueBrand = "#FF00AA"; // magenta-family, high hue
    const result = deriveAccentBase(highHueBrand, "complementary");
    const resultHue = hueOf(result);
    expect(resultHue).toBeGreaterThanOrEqual(0);
    expect(resultHue).toBeLessThan(360);
  });

  it("is deterministic for the same brand hex and rule", () => {
    expect(deriveAccentBase(brandHex, "triadic")).toBe(
      deriveAccentBase(brandHex, "triadic")
    );
  });
});
