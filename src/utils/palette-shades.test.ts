import { describe, expect, it } from "vitest";

import { SHADE_STOPS, type ColorShade } from "@/types/colors";
import { toPaletteShades } from "./palette-shades";

const shade = (value: number, hex: string): ColorShade => ({
  value,
  hex,
  name: `brand-${value}`,
});

const COMPLETE: ColorShade[] = [
  shade(50, "#EBF8FF"),
  shade(100, "#BEE3F8"),
  shade(200, "#90CDF4"),
  shade(300, "#63B3ED"),
  shade(400, "#4299E1"),
  shade(500, "#3182CE"),
  shade(600, "#2B6CB0"),
  shade(700, "#2C5282"),
  shade(800, "#2A4365"),
  shade(900, "#1A365D"),
  shade(950, "#102A4C"),
];

describe("toPaletteShades", () => {
  it("maps every stop to its hex", () => {
    const result = toPaletteShades(COMPLETE);

    for (const stop of SHADE_STOPS) {
      expect(result[stop], `stop ${stop}`).toBe(
        COMPLETE.find((s) => s.value === stop)!.hex
      );
    }
  });

  it("always produces the full stop scale", () => {
    expect(Object.keys(toPaletteShades(COMPLETE)).map(Number)).toEqual([
      ...SHADE_STOPS,
    ]);
  });

  it("ignores the order of the input list", () => {
    const shuffled = [...COMPLETE].reverse();

    expect(toPaletteShades(shuffled)).toEqual(toPaletteShades(COMPLETE));
  });

  it("fills uncovered stops with an empty string by default", () => {
    const result = toPaletteShades([shade(500, "#3182CE")]);

    expect(result[500]).toBe("#3182CE");
    expect(result[50]).toBe("");
    expect(result[950]).toBe("");
  });

  it("uses a caller-supplied fallback for uncovered stops", () => {
    const result = toPaletteShades([shade(500, "#3182CE")], "#FFFFFF");

    expect(result[500]).toBe("#3182CE");
    expect(result[900]).toBe("#FFFFFF");
  });

  it("still returns the full scale for an empty list", () => {
    const result = toPaletteShades([]);

    expect(Object.keys(result)).toHaveLength(SHADE_STOPS.length);
    expect(new Set(Object.values(result))).toEqual(new Set([""]));
  });

  it("drops values that are not part of the stop scale", () => {
    const result = toPaletteShades([...COMPLETE, shade(42, "#123456")]);

    expect(Object.values(result)).not.toContain("#123456");
    expect(Object.keys(result).map(Number)).toEqual([...SHADE_STOPS]);
  });

  it("keeps the first entry when a stop appears twice", () => {
    const result = toPaletteShades([
      shade(500, "#AAAAAA"),
      shade(500, "#BBBBBB"),
    ]);

    expect(result[500]).toBe("#AAAAAA");
  });
});
