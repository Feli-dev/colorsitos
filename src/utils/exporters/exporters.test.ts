import { describe, expect, it } from "vitest";

import { exportChakraV2 } from "./chakra-v2";
import { exportChakraV3 } from "./chakra-v3";
import type { PaletteShades } from "@/types/colors";
import { exportTailwindV3 } from "./tailwind-v3";
import {
  exportTailwindV4CssVars,
  exportTailwindV4Usage,
} from "./tailwind-v4";

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

describe("exportTailwindV3", () => {
  const output = exportTailwindV3("brand", SHADES);

  it("nests every shade under the brand key", () => {
    expect(output).toContain("colors: {\n        brand: {");
    for (const [stop, hex] of Object.entries(SHADES)) {
      expect(output).toContain(`${stop}: '${hex}',`);
    }
  });

  it("emits a config satisfying the Tailwind Config type", () => {
    expect(output).toContain("import type { Config } from 'tailwindcss';");
    expect(output.trimEnd()).toMatch(/satisfies Config;$/);
  });
});

describe("exportTailwindV4CssVars", () => {
  it("emits one custom property per shade inside :root", () => {
    const output = exportTailwindV4CssVars("brand", SHADES);

    expect(output).toContain(":root {");
    for (const [stop, hex] of Object.entries(SHADES)) {
      expect(output).toContain(`  --brand-${stop}: ${hex};`);
    }
  });

  it("orders shades numerically regardless of key insertion order", () => {
    const shuffled = {
      500: SHADES[500],
      50: SHADES[50],
      950: SHADES[950],
      100: SHADES[100],
      200: SHADES[200],
      300: SHADES[300],
      400: SHADES[400],
      600: SHADES[600],
      700: SHADES[700],
      800: SHADES[800],
      900: SHADES[900],
    } as PaletteShades;

    const stops = [...exportTailwindV4CssVars("brand", shuffled).matchAll(
      /--brand-(\d+):/g
    )].map((match) => Number(match[1]));

    expect(stops).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
  });

  it("uses the prefix option instead of the brand key", () => {
    expect(exportTailwindV4CssVars("brand", SHADES, { prefix: "ds" })).toContain(
      "--ds-500:"
    );
  });

  it("falls back to the brand key when the prefix is blank", () => {
    expect(
      exportTailwindV4CssVars("brand", SHADES, { prefix: "   " })
    ).toContain("--brand-500:");
  });

  it("renames shades to 1-based indexes with useIndex", () => {
    const output = exportTailwindV4CssVars("brand", SHADES, { useIndex: true });

    expect(output).toContain(`  --brand-1: ${SHADES[50]};`);
    expect(output).toContain(`  --brand-11: ${SHADES[950]};`);
    expect(output).not.toContain("--brand-500:");
  });
});

describe("exportTailwindV4Usage", () => {
  it("references the 500 and 600 variables for the brand key", () => {
    const output = exportTailwindV4Usage("brand");

    expect(output).toContain("var(--brand-500)");
    expect(output).toContain("var(--brand-600)");
  });
});

describe("exportChakraV2", () => {
  const output = exportChakraV2("brand", SHADES);

  it("drops the 950 shade that Chakra v2 does not support", () => {
    expect(output).toContain(`900: '${SHADES[900]}',`);
    expect(output).not.toContain("950:");
    expect(output).not.toContain(SHADES[950]);
  });

  it("keeps the remaining ten shades under colors", () => {
    expect(output).toContain("colors: {\n    brand: {");
    for (const stop of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
      expect(output).toContain(`${stop}: '${SHADES[stop as 50]}',`);
    }
  });

  it("exports an extendTheme default", () => {
    expect(output).toContain("import { extendTheme } from '@chakra-ui/react';");
    expect(output.trimEnd()).toMatch(/export default theme;$/);
  });
});

describe("exportChakraV3", () => {
  const output = exportChakraV3("brand", SHADES);

  it("nests all eleven shades under tokens.colors", () => {
    expect(output).toContain("tokens: {\n    colors: {\n      brand: {");
    for (const [stop, hex] of Object.entries(SHADES)) {
      expect(output).toContain(`${stop}: '${hex}',`);
    }
  });

  it("keeps the 950 shade that v2 strips", () => {
    expect(output).toContain(`950: '${SHADES[950]}',`);
  });
});
