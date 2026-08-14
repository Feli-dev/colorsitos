import { describe, expect, it, vi } from "vitest";

import { SHADE_STOPS, type PaletteShades } from "@/types/colors";
import { getContrastRatio } from "./color-utils";
import { generateColorPalette } from "./palette-generator";
import {
  CONTRAST_FLOOR,
  generateAccessibleTextColors,
  meetsContrastFloor,
  randomHexColor,
  toTextColors,
} from "./text-colors";

describe("randomHexColor", () => {
  const samples = Array.from({ length: 200 }, () => randomHexColor());

  it("always produces an uppercase 6-digit hex", () => {
    for (const hex of samples) expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("is not constant", () => {
    expect(new Set(samples).size).toBeGreaterThan(1);
  });

  it("spans the whole RGB cube rather than the vivid subset", () => {
    // The point of this function versus generateRandomColor in color-utils:
    // it is uniform, so near-black and near-white are both reachable.
    const luminanceProxy = samples.map((hex) => parseInt(hex.slice(1, 3), 16));
    expect(Math.min(...luminanceProxy)).toBeLessThan(60);
    expect(Math.max(...luminanceProxy)).toBeGreaterThan(195);
  });
});

describe("meetsContrastFloor", () => {
  it("accepts colours that clear the floor against white", () => {
    expect(getContrastRatio("#000000", "#FFFFFF")).toBeGreaterThan(
      CONTRAST_FLOOR
    );
    expect(meetsContrastFloor("#000000")).toBe(true);
  });

  it("accepts colours that clear the floor against black", () => {
    expect(meetsContrastFloor("#FFFFFF")).toBe(true);
  });

  it("cannot reject anything at the AA floor, and that is provable", () => {
    // The hardest colour to read sits at the crossover, where its contrast
    // against black equals its contrast against white. That value is
    // 1.05 / sqrt(1.05 * 0.05) = 4.5826, which already clears 4.5 — so no
    // colour in sRGB can fail this check while CONTRAST_FLOOR is 4.5.
    const crossover = 1.05 / Math.sqrt(1.05 * 0.05);
    expect(crossover).toBeGreaterThan(CONTRAST_FLOOR);

    // Empirically: every grey, plus the worst colour found over a wide sample.
    for (let i = 0; i < 256; i++) {
      const v = i.toString(16).padStart(2, "0").toUpperCase();
      expect(meetsContrastFloor(`#${v}${v}${v}`)).toBe(true);
    }
    expect(meetsContrastFloor("#BF42AB")).toBe(true);
  });

  it("would reject at the AAA floor, which is why the check is kept", () => {
    // #BF42AB is the worst case: 4.5826 against its better background.
    const best = Math.max(
      getContrastRatio("#BF42AB", "#FFFFFF"),
      getContrastRatio("#BF42AB", "#000000")
    );
    expect(best).toBeCloseTo(4.5826, 3);
    expect(best).toBeLessThan(7);
  });

  it("needs only one of the two backgrounds", () => {
    // Text sits on one background or the other, never both.
    const nearWhite = "#F5F5F5";
    expect(getContrastRatio(nearWhite, "#FFFFFF")).toBeLessThan(CONTRAST_FLOOR);
    expect(getContrastRatio(nearWhite, "#000000")).toBeGreaterThan(
      CONTRAST_FLOOR
    );
    expect(meetsContrastFloor(nearWhite)).toBe(true);
  });
});

describe("toTextColors", () => {
  const palette: PaletteShades = generateColorPalette("#3182CE");
  const result = toTextColors(palette);

  it("maps each role to its stop", () => {
    expect(result.primary).toBe(palette[500]);
    expect(result.secondary).toBe(palette[600]);
    expect(result.dark).toBe(palette[800]);
    expect(result.light).toBe(palette[200]);
  });

  it("keeps the full palette", () => {
    expect(Object.keys(result.palette).map(Number)).toEqual([...SHADE_STOPS]);
  });

  it("splits the ramp into a light half and a dark half", () => {
    expect(result.lightColors).toEqual([
      palette[50],
      palette[100],
      palette[200],
      palette[300],
      palette[400],
    ]);
    expect(result.darkColors).toEqual([
      palette[600],
      palette[700],
      palette[800],
      palette[900],
      palette[950],
    ]);
  });

  it("contains no undefined entries", () => {
    for (const value of [...result.lightColors, ...result.darkColors]) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe("generateAccessibleTextColors", () => {
  it("returns colours whose primary clears the contrast floor", () => {
    for (let i = 0; i < 25; i++) {
      const result = generateAccessibleTextColors();
      if (result) expect(meetsContrastFloor(result.primary)).toBe(true);
    }
  });

  it("never returns null at the AA floor", () => {
    // Follows from meetsContrastFloor being unrejectable at 4.5. The null path
    // exists for a raised floor, not for this one.
    for (let i = 0; i < 50; i++) {
      expect(generateAccessibleTextColors()).not.toBeNull();
    }
  });

  it("succeeds on the first attempt, so the retry loop never spins", () => {
    const spy = vi.spyOn(Math, "random");

    generateAccessibleTextColors(10);

    // randomHexColor draws exactly three times. More than three would mean a
    // second attempt ran — which cannot happen while the floor is 4.5.
    expect(spy.mock.calls).toHaveLength(3);
    spy.mockRestore();
  });

  it("gives up rather than throwing when nothing qualifies", () => {
    // The floor cannot reject, so the exhausted path is reached by asking for
    // zero attempts. Without this the null branch would be untested.
    expect(generateAccessibleTextColors(0)).toBeNull();
  });
});
