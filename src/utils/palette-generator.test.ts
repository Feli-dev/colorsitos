import { describe, expect, it } from "vitest";

import { hexToRgb, rgbToHsl } from "./color-utils";
import { createSwatches, generateColorPalette } from "./palette-generator";

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const lightnessOf = (hex: string): number => {
  const rgb = hexToRgb(hex);
  expect(rgb, `unparseable hex: ${hex}`).not.toBeNull();
  return rgbToHsl(rgb!.r, rgb!.g, rgb!.b).l;
};

describe("generateColorPalette", () => {
  it("returns every standard shade as an uppercase 6-digit hex", () => {
    const palette = generateColorPalette("#3182CE");

    expect(Object.keys(palette).map(Number).sort((a, b) => a - b)).toEqual([
      ...STOPS,
    ]);

    for (const stop of STOPS) {
      expect(palette[stop], `stop ${stop}`).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("preserves the base color exactly at stop 500", () => {
    expect(generateColorPalette("#3182CE")[500]).toBe("#3182CE");
    expect(generateColorPalette("#3182ce")[500]).toBe("#3182CE");
  });

  it("accepts 3-digit shorthand and hex without a hash", () => {
    expect(generateColorPalette("f00")[500]).toBe("#FF0000");
    expect(generateColorPalette("3182CE")[500]).toBe("#3182CE");
  });

  it("gets darker as the stop increases", () => {
    const palette = generateColorPalette("#3182CE");

    expect(lightnessOf(palette[50])).toBeGreaterThan(
      lightnessOf(palette[300])
    );
    expect(lightnessOf(palette[300])).toBeGreaterThan(
      lightnessOf(palette[700])
    );
    expect(lightnessOf(palette[700])).toBeGreaterThan(
      lightnessOf(palette[950])
    );
  });

  it("handles achromatic input without emitting NaN-derived colors", () => {
    // Grayscale hues are NaN in both HSL and HSLuv; the generator normalizes them.
    for (const gray of ["#808080", "#FFFFFF", "#000000"]) {
      const palette = generateColorPalette(gray);
      for (const stop of STOPS) {
        expect(palette[stop], `${gray} stop ${stop}`).toMatch(
          /^#[0-9A-F]{6}$/
        );
      }
    }
  });

  it("is deterministic for the same input", () => {
    expect(generateColorPalette("#805AD5")).toEqual(
      generateColorPalette("#805AD5")
    );
  });

  it("produces different ramps in linear and perceived color modes", () => {
    const perceived = generateColorPalette("#3182CE", {
      colorMode: "perceived",
    });
    const linear = generateColorPalette("#3182CE", { colorMode: "linear" });

    expect(linear[500]).toBe(perceived[500]);
    expect(linear[900]).not.toBe(perceived[900]);
  });

  it("narrows the ramp when lMin and lMax are tightened", () => {
    const wide = generateColorPalette("#3182CE");
    const narrow = generateColorPalette("#3182CE", { lMin: 20, lMax: 80 });

    expect(lightnessOf(narrow[50])).toBeLessThan(lightnessOf(wide[50]));
    expect(lightnessOf(narrow[950])).toBeGreaterThan(lightnessOf(wide[950]));
  });

  it("wraps invalid input in a generatePalette error", () => {
    expect(() => generateColorPalette("nope")).toThrow(/generatePalette error/);
    expect(() => generateColorPalette("")).toThrow(/Invalid hex color/);
  });
});

describe("createSwatches", () => {
  it("emits the full stop range including the 0 and 1000 endpoints", () => {
    const swatches = createSwatches({ value: "3182CE", valueStop: 500 });

    expect(swatches.map((swatch) => swatch.stop)).toEqual([
      0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000,
    ]);
  });

  it("anchors the input color at the requested valueStop", () => {
    const swatches = createSwatches({ value: "3182CE", valueStop: 400 });
    const anchor = swatches.find((swatch) => swatch.stop === 400);

    expect(anchor?.hex).toBe("#3182CE");
    expect(anchor?.hScale).toBe(0);
  });

  it("rejects a valueStop outside the known stop scale", () => {
    expect(() => createSwatches({ value: "3182CE", valueStop: 999 })).toThrow(
      "Invalid valueStop: 999"
    );
  });

  it("never reports NaN for hue, saturation or lightness", () => {
    const swatches = createSwatches({ value: "808080", valueStop: 500 });

    for (const swatch of swatches) {
      expect(Number.isNaN(swatch.h), `h at ${swatch.stop}`).toBe(false);
      expect(Number.isNaN(swatch.s), `s at ${swatch.stop}`).toBe(false);
      expect(Number.isNaN(swatch.l), `l at ${swatch.stop}`).toBe(false);
    }
  });

  it("shifts hue away from the anchor when the h tweak is set", () => {
    const untweaked = createSwatches({ value: "3182CE", valueStop: 500 });
    const tweaked = createSwatches({ value: "3182CE", valueStop: 500, h: 10 });

    const hueAt = (swatches: typeof untweaked, stop: number) =>
      swatches.find((swatch) => swatch.stop === stop)!.h;

    expect(hueAt(tweaked, 500)).toBeCloseTo(hueAt(untweaked, 500), 5);
    expect(hueAt(tweaked, 900)).not.toBeCloseTo(hueAt(untweaked, 900), 1);
  });
});
