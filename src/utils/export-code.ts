import {
  RAMP_ROLES,
  SHADE_STOPS,
  type PaletteShades,
  type RampSet,
  type ShadeStop,
} from "@/types/colors";
import {
  hexToHslString,
  hexToOklchString,
  hexToRgbString,
} from "./color-utils";
import {
  chakraV2Fragment,
  exportChakraV2,
  wrapChakraV2,
} from "./exporters/chakra-v2";
import {
  cssVariablesFragment,
  exportCssVariables,
  exportCssVariablesUsage,
  wrapCssVariables,
} from "./exporters/css-variables";
import {
  chakraV3Fragment,
  exportChakraV3,
  wrapChakraV3,
} from "./exporters/chakra-v3";
import {
  deriveRolesFromRampSet,
  deriveRolesFromSingleRamp,
  renderShadcnTheme,
  ROLE_KEYS,
  type RoleMap,
} from "./exporters/shadcn";
import {
  exportTailwindV3,
  tailwindV3Fragment,
  wrapTailwindV3,
} from "./exporters/tailwind-v3";
import {
  exportTailwindV4Theme,
  exportTailwindV4Usage,
  tailwindV4Fragment,
  wrapTailwindV4Theme,
} from "./exporters/tailwind-v4";

export type ExportKind =
  | "tw4"
  | "tw3"
  | "chakra3"
  | "chakra2"
  | "cssvars"
  | "codes"
  | "shadcn";
export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

/** Renders a hex colour in the format the user picked. */
export function formatHex(hex: string, format: ColorFormat): string {
  switch (format) {
    case "rgb":
      return hexToRgbString(hex);
    case "hsl":
      return hexToHslString(hex);
    case "oklch":
      return hexToOklchString(hex);
    default:
      return hex.toUpperCase();
  }
}

/** The bare list of colours, one per line, ascending by stop. */
export function exportJustTheCodes(
  shades: PaletteShades,
  format: ColorFormat
): string {
  return SHADE_STOPS.map((stop) => formatHex(shades[stop], format)).join("\n");
}

/** Restates a palette with every colour rendered in the chosen format. */
function inFormat(shades: PaletteShades, format: ColorFormat): PaletteShades {
  const at = (stop: ShadeStop): string => formatHex(shades[stop], format);

  return {
    50: at(50),
    100: at(100),
    200: at(200),
    300: at(300),
    400: at(400),
    500: at(500),
    600: at(600),
    700: at(700),
    800: at(800),
    900: at(900),
    950: at(950),
  };
}

type FrameworkExporter = (brandKey: string, shades: PaletteShades) => string;

/**
 * Every framework target takes the same arguments, so the four branches that
 * used to differ only in which function they called collapse into a lookup.
 * Tailwind v4 is the one that needs a wrapper, because it appends a usage
 * example to the variable block.
 */
const FRAMEWORK_EXPORTERS: Record<
  Exclude<ExportKind, "codes" | "shadcn">,
  FrameworkExporter
> = {
  tw4: (brandKey, shades) =>
    `${exportTailwindV4Theme(brandKey, shades)}\n\n${exportTailwindV4Usage(
      brandKey
    )}`,
  cssvars: (brandKey, shades) =>
    `${exportCssVariables(brandKey, shades)}\n\n${exportCssVariablesUsage(
      brandKey
    )}`,
  tw3: exportTailwindV3,
  chakra3: exportChakraV3,
  chakra2: exportChakraV2,
};

/**
 * Formats every role's light/dark hex through `formatHex`.
 *
 * `deriveRolesFromSingleRamp` needs real hex to run the destructive ladder
 * and contrast checks, so — unlike the other exporters — shadcn derives its
 * roles first and formats the *result*, rather than formatting the input
 * shades before deriving from them.
 */
function formatRoleMap(roles: RoleMap, format: ColorFormat): RoleMap {
  const formatted = {} as RoleMap;
  for (const key of ROLE_KEYS) {
    formatted[key] = {
      light: formatHex(roles[key].light, format),
      dark: formatHex(roles[key].dark, format),
    };
  }
  return formatted;
}

export function buildExportCode(
  kind: ExportKind,
  shades: PaletteShades,
  brandKey: string,
  format: ColorFormat
): string {
  if (kind === "codes") return exportJustTheCodes(shades, format);

  if (kind === "shadcn") {
    const roles = deriveRolesFromSingleRamp(shades);
    return renderShadcnTheme(formatRoleMap(roles, format));
  }

  const exporter = FRAMEWORK_EXPORTERS[kind];
  if (!exporter) return "";

  return exporter(brandKey, inFormat(shades, format));
}

type FragmentExporter = (key: string, shades: PaletteShades) => string;

/**
 * Every non-`codes`, non-`shadcn` kind's fragment function, keyed the same
 * way `FRAMEWORK_EXPORTERS` is above. `shadcn` has no fragment -- it does not
 * participate in the same-key-per-ramp merge (decision 1's fragment table).
 */
const COMBINED_FRAGMENTS: Record<
  Exclude<ExportKind, "codes" | "shadcn">,
  FragmentExporter
> = {
  tw4: tailwindV4Fragment,
  cssvars: cssVariablesFragment,
  tw3: tailwindV3Fragment,
  chakra3: chakraV3Fragment,
  chakra2: chakraV2Fragment,
};

const COMBINED_WRAPS: Record<
  Exclude<ExportKind, "codes" | "shadcn">,
  (body: string) => string
> = {
  tw4: wrapTailwindV4Theme,
  cssvars: wrapCssVariables,
  tw3: wrapTailwindV3,
  chakra3: wrapChakraV3,
  chakra2: wrapChakraV2,
};

/** Join separator between two ramps' fragments, per decision 1's table. */
const COMBINED_SEPARATORS: Record<Exclude<ExportKind, "codes" | "shadcn">, string> = {
  tw4: "\n\n",
  cssvars: "\n\n",
  tw3: ",\n",
  chakra3: ",\n",
  chakra2: ",\n",
};

/** `RAMP_ROLES` with `brand` replaced by the user's own `brandKey` (decision H). */
function combinedKeys(brandKey: string): Record<(typeof RAMP_ROLES)[number], string> {
  const keys = {} as Record<(typeof RAMP_ROLES)[number], string>;
  for (const role of RAMP_ROLES) {
    keys[role] = role === "brand" ? brandKey : role;
  }
  return keys;
}

/**
 * Renders the whole `RampSet` as one export document (design decision A's
 * "whole system" shape, alongside `buildExportCode`'s existing single-ramp
 * path). Keys are fixed by `RAMP_ROLES`, never derived from a palette name
 * (decision H) -- only `brand` is replaced by the caller's `brandKey`.
 *
 * `shadcn` does not merge fragments: it derives one `RoleMap` straight from
 * the full `RampSet` and renders it exactly like the single-ramp path does,
 * because a shadcn theme has one `primary`/`accent`/etc., not six named
 * copies of each role.
 */
export function buildCombinedExportCode(
  kind: ExportKind,
  ramps: RampSet,
  brandKey: string,
  format: ColorFormat
): string {
  if (kind === "shadcn") {
    const roles = deriveRolesFromRampSet(ramps);
    return renderShadcnTheme(formatRoleMap(roles, format));
  }

  const keys = combinedKeys(brandKey);

  if (kind === "codes") {
    return RAMP_ROLES.map(
      (role) => `${keys[role]}\n${exportJustTheCodes(ramps[role].shades, format)}`
    ).join("\n\n");
  }

  const fragmentFn = COMBINED_FRAGMENTS[kind];
  const wrapFn = COMBINED_WRAPS[kind];
  if (!fragmentFn || !wrapFn) return "";

  const body = RAMP_ROLES.map((role) =>
    fragmentFn(keys[role], inFormat(ramps[role].shades, format))
  ).join(COMBINED_SEPARATORS[kind]);

  return wrapFn(body);
}
