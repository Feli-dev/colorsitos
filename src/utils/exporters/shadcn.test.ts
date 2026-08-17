import { describe, expect, it } from "vitest";

import type { PaletteShades } from "@/types/colors";
import { deriveDestructive } from "@/utils/ramps/destructive-ladder";
import {
  deriveRolesFromSingleRamp,
  renderShadcnTheme,
  ROLE_CSS_VAR,
  ROLE_KEYS,
  type RoleMap,
} from "./shadcn";

// A real generated ramp (brand blue), pinned as a fixture so results are
// deterministic and traceable back to real hex values — same fixture shape
// as contrast-report.test.ts.
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

/** A hand-built RoleMap, deliberately not derived from any ramp. */
function handBuiltRoleMap(): RoleMap {
  const map = {} as RoleMap;
  for (const key of ROLE_KEYS) {
    map[key] = { light: "#111111", dark: "#EEEEEE" };
  }
  return map;
}

describe("deriveRolesFromSingleRamp", () => {
  it("produces a value for every declared role", () => {
    const roles = deriveRolesFromSingleRamp(BLUE_SHADES);

    for (const key of ROLE_KEYS) {
      expect(roles[key].light).toMatch(/^#[0-9A-F]{6}$/i);
      expect(roles[key].dark).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("derives destructive via the hue-separation ladder from slice 3, not a fixed hex", () => {
    const roles = deriveRolesFromSingleRamp(BLUE_SHADES);
    const expected = deriveDestructive(BLUE_SHADES[500]).hex;

    expect(roles.destructive.light).toBe(expected);
    expect(roles.destructive.dark).toBe(expected);
  });

  it("derives a different destructive hue for a different brand, proving it is not hardcoded", () => {
    const RED_SHADES: PaletteShades = {
      ...BLUE_SHADES,
      500: "#E53E3E",
    };

    const blueRoles = deriveRolesFromSingleRamp(BLUE_SHADES);
    const redRoles = deriveRolesFromSingleRamp(RED_SHADES);

    expect(redRoles.destructive.light).not.toBe(blueRoles.destructive.light);
  });

  it("uses distinct light and dark backgrounds", () => {
    const roles = deriveRolesFromSingleRamp(BLUE_SHADES);

    expect(roles.background.light).not.toBe(roles.background.dark);
    expect(roles.foreground.light).not.toBe(roles.foreground.dark);
  });
});

describe("renderShadcnTheme — renderer is ramp-independent", () => {
  it("renders a valid theme from a hand-built RoleMap, without any ramp or derivation logic", () => {
    const roles = handBuiltRoleMap();

    const css = renderShadcnTheme(roles);

    expect(css).toContain("--background: #111111;");
    expect(css).toContain("--background: #EEEEEE;");
  });

  it("emits exactly one :root block and one .dark block", () => {
    const css = renderShadcnTheme(handBuiltRoleMap());

    expect(css.match(/:root \{/g)).toHaveLength(1);
    expect(css.match(/\.dark \{/g)).toHaveLength(1);
  });

  it("never emits a --destructive-foreground token", () => {
    const css = renderShadcnTheme(deriveRolesFromSingleRamp(BLUE_SHADES));

    expect(css).not.toContain("--destructive-foreground");
    expect(css).toContain("--destructive:");
  });

  it("never emits --chart-* or --sidebar-* tokens", () => {
    const css = renderShadcnTheme(deriveRolesFromSingleRamp(BLUE_SHADES));

    expect(css).not.toMatch(/--chart-/);
    expect(css).not.toMatch(/--sidebar-/);
  });

  it("emits every declared role's CSS variable in both blocks", () => {
    const roles = handBuiltRoleMap();
    const css = renderShadcnTheme(roles);
    const rootBlock = css.split(".dark {")[0];
    const darkBlock = css.split(".dark {")[1];

    for (const key of ROLE_KEYS) {
      const cssVar = `--${ROLE_CSS_VAR[key]}:`;
      expect(rootBlock).toContain(cssVar);
      expect(darkBlock).toContain(cssVar);
    }
  });
});
