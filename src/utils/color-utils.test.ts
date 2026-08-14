import { describe, expect, it } from "vitest";

import {
  createColorPalette,
  generateRandomColor,
  getContrastRatio,
  hexToHslString,
  hexToOklchString,
  hexToRgb,
  hexToRgbString,
  hslToRgb,
  isLightColor,
  isValidHex,
  rgbToHex,
  rgbToHsl,
  validateHex,
} from "./color-utils";

const SAMPLE_HEXES = [
  "#3182CE",
  "#E53E3E",
  "#38A169",
  "#D69E2E",
  "#805AD5",
  "#ED8936",
];

describe("hexToRgb", () => {
  it("parses a 6-digit hex with a leading hash", () => {
    expect(hexToRgb("#3182CE")).toEqual({ r: 49, g: 130, b: 206 });
  });

  it("parses a 6-digit hex without a leading hash", () => {
    expect(hexToRgb("3182ce")).toEqual({ r: 49, g: 130, b: 206 });
  });

  it("rejects 3-digit shorthand, unlike isValidHex", () => {
    expect(hexToRgb("#FFF")).toBeNull();
    expect(isValidHex("#FFF")).toBe(true);
  });

  it("returns null for non-hex input", () => {
    expect(hexToRgb("nope")).toBeNull();
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#GGGGGG")).toBeNull();
  });
});

describe("getContrastRatio", () => {
  it("returns the maximum WCAG ratio for black on white", () => {
    expect(getContrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 5);
  });

  it("is symmetric", () => {
    expect(getContrastRatio("#000000", "#FFFFFF")).toBeCloseTo(
      getContrastRatio("#FFFFFF", "#000000"),
      10
    );
  });

  it("returns 1 for identical colors", () => {
    expect(getContrastRatio("#3182CE", "#3182CE")).toBeCloseTo(1, 10);
  });

  it("returns 0 when either color cannot be parsed", () => {
    expect(getContrastRatio("nope", "#000000")).toBe(0);
    expect(getContrastRatio("#000000", "nope")).toBe(0);
  });
});

describe("isLightColor", () => {
  it("treats white as light and black as dark", () => {
    expect(isLightColor("#FFFFFF")).toBe(true);
    expect(isLightColor("#000000")).toBe(false);
  });

  it("treats mid grey as dark because it uses relative luminance, not lightness", () => {
    // #808080 sits at 50% HSL lightness but only ~0.216 relative luminance.
    expect(rgbToHsl(128, 128, 128).l).toBeCloseTo(50.2, 1);
    expect(isLightColor("#808080")).toBe(false);
  });

  it("returns false for unparseable input", () => {
    expect(isLightColor("nope")).toBe(false);
  });
});

describe("isValidHex", () => {
  it("accepts 3- and 6-digit hex with a leading hash", () => {
    expect(isValidHex("#FFF")).toBe(true);
    expect(isValidHex("#ffffff")).toBe(true);
  });

  it("requires the leading hash", () => {
    expect(isValidHex("FFFFFF")).toBe(false);
  });

  it("rejects malformed values", () => {
    expect(isValidHex("#FFFF")).toBe(false);
    expect(isValidHex("#GGGGGG")).toBe(false);
    expect(isValidHex("")).toBe(false);
  });
});

describe("validateHex", () => {
  it("normalizes to uppercase #RRGGBB", () => {
    expect(validateHex("#3182ce")).toBe("#3182CE");
  });

  it("adds the missing hash", () => {
    expect(validateHex("3182ce")).toBe("#3182CE");
  });

  it("expands 3-digit shorthand", () => {
    expect(validateHex("f00")).toBe("#FF0000");
    expect(validateHex("#f00")).toBe("#FF0000");
  });

  it("trims surrounding whitespace", () => {
    expect(validateHex("  #f00  ")).toBe("#FF0000");
  });

  it("throws on empty or malformed input", () => {
    expect(() => validateHex("")).toThrow("Invalid hex color");
    expect(() => validateHex("   ")).toThrow("Invalid hex color");
    expect(() => validateHex("#12345")).toThrow("Invalid hex color");
    expect(() => validateHex("#GGGGGG")).toThrow("Invalid hex color");
  });
});

describe("rgbToHsl", () => {
  it("maps the primaries to their canonical hues", () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
  });

  it("reports zero saturation and hue for achromatic colors", () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });
});

describe("hslToRgb", () => {
  it("maps the canonical hues back to the primaries", () => {
    expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
    expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("wraps hue outside [0, 360)", () => {
    expect(hslToRgb(360, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb(-120, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("clamps saturation and lightness to their valid ranges", () => {
    expect(hslToRgb(0, 200, 50)).toEqual({ r: 255, g: 0, b: 0 });
    expect(hslToRgb(0, 100, -50)).toEqual({ r: 0, g: 0, b: 0 });
    expect(hslToRgb(0, 100, 150)).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe("rgbToHex", () => {
  it("formats channels as uppercase hex", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#FF0000");
    expect(rgbToHex(49, 130, 206)).toBe("#3182CE");
  });

  it("pads single-digit channels", () => {
    expect(rgbToHex(0, 0, 10)).toBe("#00000A");
  });

  it("clamps out-of-range channels", () => {
    expect(rgbToHex(-5, 300, 10)).toBe("#00FF0A");
  });
});

describe("hex -> rgb -> hsl -> rgb -> hex round trip", () => {
  it.each(SAMPLE_HEXES)("survives %s within one unit per channel", (hex) => {
    const rgb = hexToRgb(hex);
    expect(rgb).not.toBeNull();

    const hsl = rgbToHsl(rgb!.r, rgb!.g, rgb!.b);
    const back = hslToRgb(hsl.h, hsl.s, hsl.l);

    // rgbToHsl rounds hue to whole degrees, so a channel can drift by one.
    expect(Math.abs(back.r - rgb!.r), "red channel").toBeLessThanOrEqual(1);
    expect(Math.abs(back.g - rgb!.g), "green channel").toBeLessThanOrEqual(1);
    expect(Math.abs(back.b - rgb!.b), "blue channel").toBeLessThanOrEqual(1);
  });
});

describe("hexToOklchString", () => {
  const parse = (value: string) => {
    const match = /^oklch\((\S+) (\S+) (\S+)\)$/.exec(value);
    expect(match, `unexpected oklch format: ${value}`).not.toBeNull();
    return {
      l: Number(match![1]),
      c: Number(match![2]),
      h: Number(match![3]),
    };
  };

  it("emits a CSS oklch() string", () => {
    expect(hexToOklchString("#3182CE")).toMatch(
      /^oklch\(\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?\)$/
    );
  });

  it("converts sRGB red to its known OKLCH coordinates", () => {
    const { l, c, h } = parse(hexToOklchString("#FF0000"));
    expect(l).toBeCloseTo(0.628, 2);
    expect(c).toBeCloseTo(0.258, 2);
    expect(h).toBeCloseTo(29.2, 0);
  });

  it("puts white at full lightness with no chroma", () => {
    const { l, c } = parse(hexToOklchString("#FFFFFF"));
    expect(l).toBeCloseTo(1, 2);
    expect(c).toBeCloseTo(0, 3);
  });

  it("returns the uppercased input when it cannot be parsed", () => {
    expect(hexToOklchString("nope")).toBe("NOPE");
  });
});

describe("hexToRgbString", () => {
  it("formats a CSS rgb() string", () => {
    expect(hexToRgbString("#3182CE")).toBe("rgb(49, 130, 206)");
  });

  it("returns the uppercased input when it cannot be parsed", () => {
    expect(hexToRgbString("nope")).toBe("NOPE");
  });
});

describe("hexToHslString", () => {
  it("formats a CSS hsl() string with rounded components", () => {
    expect(hexToHslString("#FF0000")).toBe("hsl(0 100% 50%)");
    expect(hexToHslString("#808080")).toBe("hsl(0 0% 50%)");
  });

  it("returns the uppercased input when it cannot be parsed", () => {
    expect(hexToHslString("nope")).toBe("NOPE");
  });
});

describe("createColorPalette", () => {
  it("derives each shade name from the palette id and stop", () => {
    const palette = createColorPalette("brand", "Brand", [
      { value: 50, hex: "#EBF8FF" },
      { value: 500, hex: "#3182CE" },
    ]);

    expect(palette).toEqual({
      id: "brand",
      name: "Brand",
      shades: [
        { value: 50, hex: "#EBF8FF", name: "brand-50" },
        { value: 500, hex: "#3182CE", name: "brand-500" },
      ],
    });
  });

  it("keeps an empty shade list empty", () => {
    expect(createColorPalette("brand", "Brand", []).shades).toEqual([]);
  });
});

describe("generateRandomColor", () => {
  const samples = Array.from({ length: 50 }, () => generateRandomColor());

  it("always produces a parseable uppercase 6-digit hex", () => {
    for (const hex of samples) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("stays inside the vibrant saturation and lightness window", () => {
    for (const hex of samples) {
      const rgb = hexToRgb(hex)!;
      const { s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
      // Source range is s 50-100 and l 30-70; allow for hex rounding drift.
      expect(s).toBeGreaterThanOrEqual(48);
      expect(l).toBeGreaterThanOrEqual(28);
      expect(l).toBeLessThanOrEqual(72);
    }
  });

  it("does not return a constant", () => {
    expect(new Set(samples).size).toBeGreaterThan(1);
  });
});
