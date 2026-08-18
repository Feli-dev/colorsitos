import { describe, expect, it } from "vitest";

import type { PaletteShades, RampSet } from "@/types/colors";
import { RAMP_ROLES } from "@/types/colors";
import { buildCombinedExportCode } from "./export-code";

/**
 * A distinct, deterministic 11-stop ramp per role, so a role's own hex values
 * are recognizable in assertions without depending on real derivation.
 */
function makeShades(seed: string): PaletteShades {
  return {
    50: `#${seed}0`,
    100: `#${seed}1`,
    200: `#${seed}2`,
    300: `#${seed}3`,
    400: `#${seed}4`,
    500: `#${seed}5`,
    600: `#${seed}6`,
    700: `#${seed}7`,
    800: `#${seed}8`,
    900: `#${seed}9`,
    950: `#${seed}A`,
  };
}

const RAMPS: RampSet = {
  brand: { role: "brand", baseHex: "#AAAAA5", shades: makeShades("AAAAA"), origin: "brand" },
  neutral: { role: "neutral", baseHex: "#BBBBB5", shades: makeShades("BBBBB"), origin: "derived" },
  accent: { role: "accent", baseHex: "#CCCCC5", shades: makeShades("CCCCC"), origin: "derived" },
  success: { role: "success", baseHex: "#DDDDD5", shades: makeShades("DDDDD"), origin: "derived" },
  warning: { role: "warning", baseHex: "#EEEEE5", shades: makeShades("EEEEE"), origin: "derived" },
  danger: { role: "danger", baseHex: "#FFFFF5", shades: makeShades("FFFFF"), origin: "derived" },
};

describe("buildCombinedExportCode -- fixed keys (decision H)", () => {
  it("uses the given brandKey for the brand ramp, not a role or palette name", () => {
    const output = buildCombinedExportCode("codes", RAMPS, "primary", "hex");

    expect(output).toContain("primary");
    expect(output.split("\n\n")[0]).toContain("primary");
  });

  it("emits the other five ramps under their fixed role names regardless of brandKey", () => {
    const output = buildCombinedExportCode("tw4", RAMPS, "primary", "hex");

    for (const role of ["neutral", "accent", "success", "warning", "danger"]) {
      expect(output).toContain(`--color-${role}-500:`);
    }
    expect(output).not.toContain("--color-brand-500:");
    expect(output).toContain("--color-primary-500:");
  });
});

describe("buildCombinedExportCode -- codes (label line per ramp)", () => {
  it("labels each ramp and separates them with a blank line", () => {
    const output = buildCombinedExportCode("codes", RAMPS, "brand", "hex");
    const blocks = output.split("\n\n");

    expect(blocks).toHaveLength(6);
    expect(blocks[0].split("\n")[0]).toBe("brand");
    expect(blocks[1].split("\n")[0]).toBe("neutral");
    expect(blocks[0]).toContain(RAMPS.brand.shades[500]);
    expect(blocks[1]).toContain(RAMPS.neutral.shades[500]);
  });

  it("formats every ramp's codes in the requested notation", () => {
    const output = buildCombinedExportCode("codes", RAMPS, "brand", "hsl");

    expect(output).toMatch(/hsl\(/);
    expect(output).not.toContain("#AAAAA5".toUpperCase());
  });
});

describe("buildCombinedExportCode -- tw4 (single @theme block)", () => {
  it("produces exactly one @theme block containing all six ramps", () => {
    const output = buildCombinedExportCode("tw4", RAMPS, "brand", "hex");

    expect(output.match(/@theme \{/g)).toHaveLength(1);
    expect(output.match(/@import "tailwindcss";/g)).toHaveLength(1);
    for (const key of ["brand", "neutral", "accent", "success", "warning", "danger"]) {
      expect(output).toContain(`--color-${key}-500:`);
    }
  });
});

describe("buildCombinedExportCode -- cssvars (single :root block)", () => {
  it("produces exactly one :root block containing all six ramps", () => {
    const output = buildCombinedExportCode("cssvars", RAMPS, "brand", "hex");

    expect(output.match(/:root \{/g)).toHaveLength(1);
    for (const key of ["brand", "neutral", "accent", "success", "warning", "danger"]) {
      expect(output).toContain(`--${key}-500:`);
    }
  });
});

describe("buildCombinedExportCode -- tw3 (single extend.colors object)", () => {
  it("produces exactly one extend.colors object with all six named groups", () => {
    const output = buildCombinedExportCode("tw3", RAMPS, "brand", "hex");

    expect(output.match(/colors: \{/g)).toHaveLength(1);
    expect(output.trimEnd().endsWith("} satisfies Config;")).toBe(true);
    for (const key of ["brand", "neutral", "accent", "success", "warning", "danger"]) {
      expect(output).toContain(`${key}: {`);
    }
  });
});

describe("buildCombinedExportCode -- chakra2 (single colors object, drops 950)", () => {
  it("produces exactly one colors object with all six named groups, no 950", () => {
    const output = buildCombinedExportCode("chakra2", RAMPS, "brand", "hex");

    expect(output.match(/colors: \{/g)).toHaveLength(1);
    for (const key of ["brand", "neutral", "accent", "success", "warning", "danger"]) {
      expect(output).toContain(`${key}: {`);
    }
    expect(output).not.toContain("950:");
  });
});

describe("buildCombinedExportCode -- chakra3 (single tokens.colors object, keeps 950)", () => {
  it("produces exactly one tokens.colors object with all six named groups", () => {
    const output = buildCombinedExportCode("chakra3", RAMPS, "brand", "hex");

    expect(output.match(/tokens: \{\n {4}colors: \{/g)).toHaveLength(1);
    for (const key of ["brand", "neutral", "accent", "success", "warning", "danger"]) {
      expect(output).toContain(`${key}: {`);
    }
    expect(output).toContain(`950: '${RAMPS.danger.shades[950]}',`);
  });
});

describe("buildCombinedExportCode -- shadcn (does not participate in fragments)", () => {
  it("renders via deriveRolesFromRampSet + renderShadcnTheme, using real neutral/accent ramps", () => {
    const output = buildCombinedExportCode("shadcn", RAMPS, "brand", "hex");

    expect(output).toContain(":root {");
    expect(output).toContain(".dark {");
    expect(output).not.toContain("--destructive-foreground");
    // background comes from the neutral ramp (50/950), not the brand ramp --
    // proving this uses the multi-ramp deriver, not the single-ramp one.
    expect(output).toContain(`--background: ${RAMPS.neutral.shades[50]};`);
  });
});

describe("buildCombinedExportCode -- unknown kind", () => {
  it("returns an empty string, matching buildExportCode's own fallback", () => {
    expect(
      buildCombinedExportCode("nope" as never, RAMPS, "brand", "hex")
    ).toBe("");
  });
});

describe("buildCombinedExportCode -- snapshots (new file, never the original 24)", () => {
  const KINDS = [
    "tw4",
    "tw3",
    "chakra3",
    "chakra2",
    "cssvars",
    "codes",
    "shadcn",
  ] as const;

  it.each(KINDS)("kind %s renders a stable combined document", (kind) => {
    expect(buildCombinedExportCode(kind, RAMPS, "brand", "hex")).toMatchSnapshot();
  });
});

describe("RAMP_ROLES ordering (sanity, decision H)", () => {
  it("is brand first, then neutral/accent/success/warning/danger", () => {
    expect(RAMP_ROLES).toEqual([
      "brand",
      "neutral",
      "accent",
      "success",
      "warning",
      "danger",
    ]);
  });
});
