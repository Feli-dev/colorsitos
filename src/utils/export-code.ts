import { SHADE_STOPS, type PaletteShades } from "@/types/colors";
import {
  hexToHslString,
  hexToOklchString,
  hexToRgbString,
} from "./color-utils";
import { exportChakraV2 } from "./exporters/chakra-v2";
import { exportChakraV3 } from "./exporters/chakra-v3";
import { exportTailwindV3 } from "./exporters/tailwind-v3";
import {
  exportTailwindV4CssVars,
  exportTailwindV4Usage,
} from "./exporters/tailwind-v4";

export type ExportKind = "tw4" | "tw3" | "chakra3" | "chakra2" | "codes";
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

export function buildExportCode(
  kind: ExportKind,
  shades: PaletteShades,
  brandKey: string,
  format: ColorFormat,
  opts?: { prefix?: string; useIndex?: boolean }
): string {
  // Moved verbatim out of exporters-panel.tsx, duplication and all, so the
  // golden snapshots recorded against it describe today's behaviour exactly.
  // The next commit collapses these four branches and must not change a byte.
  switch (kind) {
    case "tw4": {
      const v4 = Object.fromEntries(
        Object.entries(shades).map(([k, v]) => [
          k,
          formatHex(v as string, format),
        ])
      ) as PaletteShades;
      return `${exportTailwindV4CssVars(brandKey, v4, {
        prefix: opts?.prefix || undefined,
        useIndex: opts?.useIndex,
      })}\n\n${exportTailwindV4Usage(brandKey)}`;
    }
    case "tw3": {
      const v3 = Object.fromEntries(
        Object.entries(shades).map(([k, v]) => [
          k,
          formatHex(v as string, format),
        ])
      ) as PaletteShades;
      return exportTailwindV3(brandKey, v3);
    }
    case "chakra3": {
      const c3 = Object.fromEntries(
        Object.entries(shades).map(([k, v]) => [
          k,
          formatHex(v as string, format),
        ])
      ) as PaletteShades;
      return exportChakraV3(brandKey, c3);
    }
    case "chakra2": {
      const c2 = Object.fromEntries(
        Object.entries(shades).map(([k, v]) => [
          k,
          formatHex(v as string, format),
        ])
      ) as PaletteShades;
      return exportChakraV2(brandKey, c2);
    }
    case "codes":
      return exportJustTheCodes(shades, format);
    default:
      return "";
  }
}
