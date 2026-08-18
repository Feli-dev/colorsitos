import { describe, expect, it } from "vitest";

import { rgbToHsl, hexToRgb } from "../color-utils";
import { deriveNeutralBase, NEUTRAL_SATURATION_MAX } from "./derive-neutral";

/**
 * 8-bit hex round-trip quantization (rgb -> hex -> rgb) can nudge the
 * re-measured saturation slightly above the value that was actually used to
 * build the colour -- the same documented phenomenon as
 * `derive-semantic.test.ts`'s `HUE_QUANTIZATION_TOLERANCE`.
 */
const SATURATION_QUANTIZATION_TOLERANCE = 1;

/**
 * Neutral has no naming constraint (design decision B' boundary) -- it is a
 * hue-preserving desaturation of the brand, capped so it reads as neutral
 * rather than a tinted brand swatch.
 */
describe("deriveNeutralBase", () => {
  it("caps saturation at NEUTRAL_SATURATION_MAX for a highly saturated brand", () => {
    const brandHex = "#3182CE"; // saturated blue
    const result = deriveNeutralBase(brandHex);
    const rgb = hexToRgb(result);
    expect(rgb).not.toBeNull();
    const { s } = rgbToHsl(rgb!.r, rgb!.g, rgb!.b);
    expect(s).toBeLessThanOrEqual(
      NEUTRAL_SATURATION_MAX + SATURATION_QUANTIZATION_TOLERANCE
    );
  });

  it("preserves the brand's hue", () => {
    const brandHex = "#3182CE";
    const brandRgb = hexToRgb(brandHex)!;
    const brandHsl = rgbToHsl(brandRgb.r, brandRgb.g, brandRgb.b);

    const result = deriveNeutralBase(brandHex);
    const resultRgb = hexToRgb(result)!;
    const resultHsl = rgbToHsl(resultRgb.r, resultRgb.g, resultRgb.b);

    expect(resultHsl.h).toBe(brandHsl.h);
  });

  it("preserves the brand's lightness", () => {
    const brandHex = "#E53E3E";
    const brandRgb = hexToRgb(brandHex)!;
    const brandHsl = rgbToHsl(brandRgb.r, brandRgb.g, brandRgb.b);

    const result = deriveNeutralBase(brandHex);
    const resultRgb = hexToRgb(result)!;
    const resultHsl = rgbToHsl(resultRgb.r, resultRgb.g, resultRgb.b);

    expect(Math.round(resultHsl.l)).toBe(Math.round(brandHsl.l));
  });

  it("leaves an already-low-saturation brand unchanged in saturation", () => {
    const brandHex = "#808080"; // achromatic, s = 0
    const result = deriveNeutralBase(brandHex);
    const rgb = hexToRgb(result)!;
    const { s } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    expect(s).toBe(0);
  });

  it("is deterministic for the same brand hex", () => {
    const brandHex = "#22C55E";
    expect(deriveNeutralBase(brandHex)).toBe(deriveNeutralBase(brandHex));
  });
});
