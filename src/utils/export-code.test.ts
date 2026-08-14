import { describe, expect, it } from "vitest";

import type { PaletteShades } from "@/types/colors";
import {
  buildExportCode,
  exportJustTheCodes,
  formatHex,
  type ColorFormat,
  type ExportKind,
} from "./export-code";

const SHADES: PaletteShades = {
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
  950: "#102A4C",
};

const KINDS: ExportKind[] = ["tw4", "tw3", "chakra3", "chakra2", "codes"];
const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl", "oklch"];

describe("formatHex", () => {
  it("uppercases for hex", () => {
    expect(formatHex("#3182ce", "hex")).toBe("#3182CE");
  });

  it("delegates to the CSS string helpers", () => {
    expect(formatHex("#3182CE", "rgb")).toBe("rgb(49, 130, 206)");
    expect(formatHex("#FF0000", "hsl")).toBe("hsl(0 100% 50%)");
    expect(formatHex("#FF0000", "oklch")).toMatch(/^oklch\(/);
  });
});

describe("exportJustTheCodes", () => {
  it("lists every stop ascending, one per line", () => {
    expect(exportJustTheCodes(SHADES, "hex").split("\n")).toEqual([
      "#EBF8FF",
      "#BEE3F8",
      "#90CDF4",
      "#63B3ED",
      "#4299E1",
      "#3182CE",
      "#2B6CB0",
      "#2C5282",
      "#2A4365",
      "#1A365D",
      "#102A4C",
    ]);
  });
});

describe("buildExportCode", () => {
  it("returns an empty string for an unknown kind", () => {
    expect(
      buildExportCode("nope" as ExportKind, SHADES, "brand", "hex")
    ).toBe("");
  });

  it("uses the brand key it is given", () => {
    expect(buildExportCode("tw3", SHADES, "primary", "hex")).toContain(
      "primary: {"
    );
  });

  // These 20 snapshots are the byte-identity contract for this refactor. They
  // are recorded against the verbatim four-branch implementation; collapsing
  // those branches must leave every one of them untouched.
  describe.each(KINDS)("kind %s", (kind) => {
    it.each(FORMATS)("renders format %s identically", (format) => {
      expect(buildExportCode(kind, SHADES, "brand", format)).toMatchSnapshot();
    });
  });
});
