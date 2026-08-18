import { describe, expect, it } from "vitest";

import {
  chakraV2Fragment,
  exportChakraV2,
  wrapChakraV2,
} from "./chakra-v2";
import {
  chakraV3Fragment,
  exportChakraV3,
  wrapChakraV3,
} from "./chakra-v3";
import type { PaletteShades } from "@/types/colors";
import {
  exportTailwindV3,
  tailwindV3Fragment,
  wrapTailwindV3,
} from "./tailwind-v3";
import {
  cssVariablesFragment,
  exportCssVariables,
  exportCssVariablesUsage,
  wrapCssVariables,
} from "./css-variables";
import {
  exportTailwindV4Theme,
  exportTailwindV4Usage,
  tailwindV4Fragment,
  wrapTailwindV4Theme,
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

describe("exportTailwindV4Theme", () => {
  const output = exportTailwindV4Theme("brand", SHADES);

  it("declares the palette inside @theme, never :root", () => {
    // Tailwind reads theme variables from this at-rule specifically. On
    // :root they are ordinary CSS and no utility is ever generated.
    expect(output).toContain("@theme {");
    expect(output).not.toContain(":root");
  });

  it("puts every shade in the --color-* namespace", () => {
    // The namespace is what creates the bg-*, text-* and border-* families.
    for (const [stop, hex] of Object.entries(SHADES)) {
      expect(output).toContain(`  --color-brand-${stop}: ${hex};`);
    }
    expect(output).not.toMatch(/--brand-\d+:/);
  });

  it("includes the import the block depends on", () => {
    // @theme does nothing without Tailwind imported above it, and the snippet
    // is meant to be pasted as-is.
    expect(output).toContain('@import "tailwindcss";');
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

    const stops = [
      ...exportTailwindV4Theme("brand", shuffled).matchAll(
        /--color-brand-(\d+):/g
      ),
    ].map((match) => Number(match[1]));

    expect(stops).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
  });

  it("renames the namespace with the brand key", () => {
    expect(exportTailwindV4Theme("acme", SHADES)).toContain(
      "--color-acme-500:"
    );
  });
});

describe("exportTailwindV4Usage", () => {
  const output = exportTailwindV4Usage("brand");

  it("demonstrates utility classes, not raw CSS properties", () => {
    // Utilities are the entire reason to pick this export; an example written
    // in background-color would demonstrate the one thing it is not for.
    expect(output).toContain("bg-brand-500");
    expect(output).toContain("hover:bg-brand-600");
    expect(output).not.toContain("background-color");
    expect(output).not.toContain("var(--");
  });

  it("follows the brand key", () => {
    expect(exportTailwindV4Usage("acme")).toContain("bg-acme-500");
  });
});

describe("exportCssVariables", () => {
  const output = exportCssVariables("brand", SHADES);

  it("emits one custom property per shade inside :root", () => {
    expect(output).toContain(":root {");
    for (const [stop, hex] of Object.entries(SHADES)) {
      expect(output).toContain(`  --brand-${stop}: ${hex};`);
    }
  });

  it("stays out of the --color-* namespace", () => {
    // This export makes no claim about Tailwind, so it must not look like a
    // theme block that failed to work.
    expect(output).not.toContain("--color-");
    expect(output).not.toContain("@theme");
  });

  it("orders shades numerically regardless of key insertion order", () => {
    const shuffled = {
      950: SHADES[950],
      50: SHADES[50],
      500: SHADES[500],
      100: SHADES[100],
      200: SHADES[200],
      300: SHADES[300],
      400: SHADES[400],
      600: SHADES[600],
      700: SHADES[700],
      800: SHADES[800],
      900: SHADES[900],
    } as PaletteShades;

    const stops = [
      ...exportCssVariables("brand", shuffled).matchAll(/--brand-(\d+):/g),
    ].map((match) => Number(match[1]));

    expect(stops).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
  });
});

describe("exportCssVariablesUsage", () => {
  it("references the 500 and 600 variables for the brand key", () => {
    const output = exportCssVariablesUsage("brand");

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

describe("tailwindV4Fragment / wrapTailwindV4Theme (Slice 11 fragment extraction)", () => {
  it("wrap(fragment(...)) reproduces exportTailwindV4Theme byte-for-byte", () => {
    // Approval test: this is the exact behavior exportTailwindV4Theme already
    // has (see the "exportTailwindV4Theme" describe block above) -- the
    // refactor must not change a single byte of it.
    expect(wrapTailwindV4Theme(tailwindV4Fragment("brand", SHADES))).toBe(
      exportTailwindV4Theme("brand", SHADES)
    );
  });

  it("the fragment is only the variable lines, with no @theme wrapper", () => {
    const fragment = tailwindV4Fragment("brand", SHADES);

    expect(fragment).not.toContain("@theme");
    expect(fragment).not.toContain("@import");
    expect(fragment).toContain("--color-brand-500: #3182CE;");
  });

  it("joining two fragments inside one wrap produces a single @theme block with both keys", () => {
    const merged = wrapTailwindV4Theme(
      [
        tailwindV4Fragment("brand", SHADES),
        tailwindV4Fragment("neutral", SHADES),
      ].join("\n\n")
    );

    expect(merged.match(/@theme \{/g)).toHaveLength(1);
    expect(merged).toContain("--color-brand-500: #3182CE;");
    expect(merged).toContain("--color-neutral-500: #3182CE;");
  });
});

describe("cssVariablesFragment / wrapCssVariables (Slice 11 fragment extraction)", () => {
  it("wrap(fragment(...)) reproduces exportCssVariables byte-for-byte", () => {
    expect(wrapCssVariables(cssVariablesFragment("brand", SHADES))).toBe(
      exportCssVariables("brand", SHADES)
    );
  });

  it("the fragment is only the variable lines, with no :root wrapper", () => {
    const fragment = cssVariablesFragment("brand", SHADES);

    expect(fragment).not.toContain(":root");
    expect(fragment).toContain("--brand-500: #3182CE;");
  });

  it("joining two fragments inside one wrap produces a single :root block with both keys", () => {
    const merged = wrapCssVariables(
      [
        cssVariablesFragment("brand", SHADES),
        cssVariablesFragment("accent", SHADES),
      ].join("\n\n")
    );

    expect(merged.match(/:root \{/g)).toHaveLength(1);
    expect(merged).toContain("--brand-500: #3182CE;");
    expect(merged).toContain("--accent-500: #3182CE;");
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

describe("tailwindV3Fragment / wrapTailwindV3 (Slice 11 fragment extraction)", () => {
  it("wrap(fragment(...)) reproduces exportTailwindV3 byte-for-byte", () => {
    expect(wrapTailwindV3(tailwindV3Fragment("brand", SHADES))).toBe(
      exportTailwindV3("brand", SHADES)
    );
  });

  it("the fragment is a self-contained named group with no trailing comma", () => {
    const fragment = tailwindV3Fragment("brand", SHADES);

    expect(fragment.trimEnd().endsWith("}")).toBe(true);
    expect(fragment).not.toContain("satisfies Config");
    expect(fragment).toContain("brand: {");
  });

  it("joining two fragments with ',\\n' inside one wrap keeps a single extend.colors object with both keys", () => {
    const merged = wrapTailwindV3(
      [
        tailwindV3Fragment("brand", SHADES),
        tailwindV3Fragment("neutral", SHADES),
      ].join(",\n")
    );

    expect(merged.match(/colors: \{/g)).toHaveLength(1);
    expect(merged).toContain("brand: {");
    expect(merged).toContain("neutral: {");
    // Exactly one comma sits between the two groups, not after the last.
    expect(merged.trimEnd().endsWith("} satisfies Config;")).toBe(true);
  });
});

describe("chakraV2Fragment / wrapChakraV2 (Slice 11 fragment extraction)", () => {
  it("wrap(fragment(...)) reproduces exportChakraV2 byte-for-byte", () => {
    expect(wrapChakraV2(chakraV2Fragment("brand", SHADES))).toBe(
      exportChakraV2("brand", SHADES)
    );
  });

  it("the fragment drops 950 just like exportChakraV2 does", () => {
    const fragment = chakraV2Fragment("brand", SHADES);

    expect(fragment).toContain(`900: '${SHADES[900]}',`);
    expect(fragment).not.toContain("950:");
  });

  it("joining two fragments inside one wrap keeps a single colors object with both keys", () => {
    const merged = wrapChakraV2(
      [
        chakraV2Fragment("brand", SHADES),
        chakraV2Fragment("accent", SHADES),
      ].join(",\n")
    );

    expect(merged.match(/colors: \{/g)).toHaveLength(1);
    expect(merged).toContain("brand: {");
    expect(merged).toContain("accent: {");
  });
});

describe("chakraV3Fragment / wrapChakraV3 (Slice 11 fragment extraction)", () => {
  it("wrap(fragment(...)) reproduces exportChakraV3 byte-for-byte", () => {
    expect(wrapChakraV3(chakraV3Fragment("brand", SHADES))).toBe(
      exportChakraV3("brand", SHADES)
    );
  });

  it("the fragment keeps the 950 shade that v2 strips", () => {
    expect(chakraV3Fragment("brand", SHADES)).toContain(
      `950: '${SHADES[950]}',`
    );
  });

  it("joining two fragments inside one wrap keeps a single tokens.colors object with both keys", () => {
    const merged = wrapChakraV3(
      [
        chakraV3Fragment("brand", SHADES),
        chakraV3Fragment("danger", SHADES),
      ].join(",\n")
    );

    expect(merged.match(/tokens: \{\n {4}colors: \{/g)).toHaveLength(1);
    expect(merged).toContain("brand: {");
    expect(merged).toContain("danger: {");
  });
});
