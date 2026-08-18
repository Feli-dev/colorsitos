import {
  SHADE_STOPS,
  type PaletteShades,
  type ShadeStop,
} from "@/types/colors";
import {
  hexToHslString,
  hexToOklchString,
  hexToRgbString,
} from "./color-utils";
import { exportChakraV2 } from "./exporters/chakra-v2";
import {
  exportCssVariables,
  exportCssVariablesUsage,
} from "./exporters/css-variables";
import { exportChakraV3 } from "./exporters/chakra-v3";
import {
  deriveRolesFromSingleRamp,
  renderShadcnTheme,
  ROLE_KEYS,
  type RoleMap,
} from "./exporters/shadcn";
import { exportTailwindV3 } from "./exporters/tailwind-v3";
import {
  exportTailwindV4Theme,
  exportTailwindV4Usage,
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
