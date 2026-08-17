import { describe, expect, it } from "vitest";

import type { PaletteShades } from "@/types/colors";
import { getContrastRatio } from "./color-utils";
import { buildContrastReport, evaluateContrastPairing } from "./contrast-report";

// A real generated ramp (brand blue), pinned as a fixture so results are
// deterministic and traceable back to real hex values.
const BLUE_SHADES: PaletteShades = {
  50: "#EBF8FF",
  100: "#BEE3F8",
  200: "#90CDF4",
  300: "#63B3ED",
  400: "#4299E1",
  500: "#3182CE",
  600: "#2B6CB0",
  700: "#2C5282",
  800: "#2A4365",
  900: "#1A365D",
  950: "#0F2942",
};

const RED_SHADES: PaletteShades = {
  50: "#FBEEEE",
  100: "#F8DCDC",
  200: "#F3BCBC",
  300: "#EE9696",
  400: "#EB7070",
  500: "#E53E3E",
  600: "#B83030",
  700: "#8A2222",
  800: "#631515",
  900: "#3B0909",
  950: "#280404",
};

describe("evaluateContrastPairing", () => {
  it("passes every WCAG threshold for black text on white", () => {
    const result = evaluateContrastPairing("#000000", "#FFFFFF");

    expect(result.ratio).toBeCloseTo(21, 0);
    expect(result.normalText).toEqual({ aa: true, aaa: true });
    expect(result.largeText).toEqual({ aa: true, aaa: true });
    expect(result.uiComponent).toEqual({ aa: true });
  });

  it("fails every WCAG threshold for white text on white", () => {
    const result = evaluateContrastPairing("#FFFFFF", "#FFFFFF");

    expect(result.ratio).toBe(1);
    expect(result.normalText).toEqual({ aa: false, aaa: false });
    expect(result.largeText).toEqual({ aa: false, aaa: false });
    expect(result.uiComponent).toEqual({ aa: false });
  });
});

describe("buildContrastReport", () => {
  it("returns a ratio and AA/AAA verdicts for normal text, large text, and UI-component thresholds", () => {
    const report = buildContrastReport(BLUE_SHADES, "Brand");
    const [pairing] = report.pairings;
    const expectedRatio = getContrastRatio(BLUE_SHADES[900], BLUE_SHADES[50]);

    expect(report.label).toBe("Brand");
    expect(pairing.id).toBe("900-on-50");
    expect(pairing.ratio).toBeCloseTo(expectedRatio);
    expect(pairing.normalText).toEqual({
      aa: expectedRatio >= 4.5,
      aaa: expectedRatio >= 7,
    });
    expect(pairing.largeText).toEqual({
      aa: expectedRatio >= 3,
      aaa: expectedRatio >= 4.5,
    });
    expect(pairing.uiComponent).toEqual({ aa: expectedRatio >= 3 });
  });

  it("builds an independent report per ramp, with no cross-ramp state", () => {
    const brandReport = buildContrastReport(BLUE_SHADES, "Brand");
    const dangerReport = buildContrastReport(RED_SHADES, "Danger");

    expect(brandReport.label).toBe("Brand");
    expect(dangerReport.label).toBe("Danger");
    expect(brandReport.pairings).not.toBe(dangerReport.pairings);
    expect(brandReport.pairings[0]?.foregroundHex).toBe(BLUE_SHADES[900]);
    expect(dangerReport.pairings[0]?.foregroundHex).toBe(RED_SHADES[900]);

    // Mutating one report's array must not leak into the next call for the
    // same ramp — proves the pairing list isn't cached/shared module state.
    brandReport.pairings.push({
      id: "tamper",
      foregroundHex: "#000000",
      backgroundHex: "#FFFFFF",
      ratio: 21,
      normalText: { aa: true, aaa: true },
      largeText: { aa: true, aaa: true },
      uiComponent: { aa: true },
    });
    const brandAgain = buildContrastReport(BLUE_SHADES, "Brand");
    expect(brandAgain.pairings).toHaveLength(1);
  });

  it("never includes an APCA or WCAG-3 value in its output shape", () => {
    const report = buildContrastReport(BLUE_SHADES);

    for (const pairing of report.pairings) {
      expect(pairing).not.toHaveProperty("apca");
      expect(pairing).not.toHaveProperty("lc");
      expect(pairing).not.toHaveProperty("wcag3");
    }
  });

  it("leaves the input palette unchanged", () => {
    const before = structuredClone(BLUE_SHADES);
    buildContrastReport(BLUE_SHADES, "Brand");

    expect(BLUE_SHADES).toEqual(before);
  });

  it("appends an externally supplied pairing — how ShowcaseGuide's hardcoded 700-on-50 combination gets audited — without dropping the default pairing", () => {
    const showcasePairing = {
      id: "700-on-50",
      foregroundHex: BLUE_SHADES[700],
      backgroundHex: BLUE_SHADES[50],
    };

    const report = buildContrastReport(BLUE_SHADES, "Brand", [showcasePairing]);
    const flagged = report.pairings.find((p) => p.id === "700-on-50");
    const expectedRatio = getContrastRatio(
      showcasePairing.foregroundHex,
      showcasePairing.backgroundHex
    );

    expect(report.pairings).toHaveLength(2);
    expect(flagged?.ratio).toBeCloseTo(expectedRatio);
    expect(flagged?.normalText.aa).toBe(expectedRatio >= 4.5);
  });
});
