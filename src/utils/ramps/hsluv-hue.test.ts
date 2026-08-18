import { describe, expect, it } from "vitest";

import {
  circularDelta,
  circularSignedDelta,
  clampToArc,
  hexFromHsluv,
  hsluvHue,
  hsluvOf,
  isAchromatic,
} from "./hsluv-hue";

describe("hsluvOf / hsluvHue", () => {
  it("resolves canonical red to the verified HSLuv hue/saturation/lightness", () => {
    const red = hsluvOf("#FF0000");

    expect(red.h).toBeCloseTo(12.177, 2);
    expect(red.s).toBeCloseTo(100, 0);
    expect(red.l).toBeCloseTo(53.237, 2);
  });

  it("resolves canonical warning to the verified HSLuv hue", () => {
    expect(hsluvHue("#F59E0B")).toBeCloseTo(44.312, 2);
  });

  it("returns only the hue component via hsluvHue", () => {
    expect(hsluvHue("#FF0000")).toBeCloseTo(hsluvOf("#FF0000").h);
  });
});

describe("hexFromHsluv", () => {
  it("round-trips back to (approximately) the same h/s/l", () => {
    const hex = hexFromHsluv(210, 80, 50);
    const back = hsluvOf(hex);

    expect(Math.abs(back.h - 210)).toBeLessThan(1);
    expect(back.s).toBeCloseTo(80, 0);
    expect(back.l).toBeCloseTo(50, 0);
  });

  it("normalizes an out-of-range hue before converting", () => {
    expect(hexFromHsluv(370, 80, 50)).toBe(hexFromHsluv(10, 80, 50));
    expect(hexFromHsluv(-10, 80, 50)).toBe(hexFromHsluv(350, 80, 50));
  });
});

describe("circularDelta", () => {
  it("measures the short way around the circle", () => {
    expect(circularDelta(350, 10)).toBeCloseTo(20);
    expect(circularDelta(10, 350)).toBeCloseTo(20);
  });

  it("returns 0 for identical hues and 180 for opposite hues", () => {
    expect(circularDelta(90, 90)).toBe(0);
    expect(circularDelta(0, 180)).toBe(180);
  });
});

describe("circularSignedDelta", () => {
  it("is positive when the target is clockwise (increasing hue)", () => {
    expect(circularSignedDelta(0, 90)).toBeCloseTo(90);
  });

  it("is negative when the target is counter-clockwise", () => {
    expect(circularSignedDelta(0, 270)).toBeCloseTo(-90);
  });

  it("resolves the exact-opposite tie to -180, never +180", () => {
    expect(circularSignedDelta(10, 190)).toBe(-180);
  });
});

describe("clampToArc", () => {
  const nonWrapping = { lo: 100, hi: 200 };
  const wrapping = { lo: 350, hi: 30 };

  it("leaves a hue already inside a non-wrapping arc unchanged", () => {
    expect(clampToArc(150, nonWrapping)).toBe(150);
  });

  it("clamps to the nearer edge when outside a non-wrapping arc", () => {
    expect(clampToArc(90, nonWrapping)).toBe(100);
    expect(clampToArc(210, nonWrapping)).toBe(200);
  });

  it("leaves a hue inside a wrapping arc unchanged, including across 0", () => {
    expect(clampToArc(10, wrapping)).toBe(10);
    expect(clampToArc(355, wrapping)).toBe(355);
  });

  it("clamps to the nearer edge when outside a wrapping arc", () => {
    expect(clampToArc(90, wrapping)).toBe(30);
    expect(clampToArc(200, wrapping)).toBe(350);
  });
});

describe("isAchromatic", () => {
  it("is true for a pure grey", () => {
    expect(isAchromatic("#808080")).toBe(true);
  });

  it("is false for a saturated colour", () => {
    expect(isAchromatic("#FF0000")).toBe(false);
  });
});
