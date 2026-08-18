import type { ChakraV2Shades, PaletteShades } from "@/types/colors";

/**
 * Split into a fragment (one ramp's named group, dropping the 950 stop, no
 * trailing comma of its own) and a wrap (the one `colors` object every
 * fragment sits inside), so a whole-system export (Feature 3) can join
 * several ramps' groups with `",\n"` and wrap them once.
 * `exportChakraV2` itself is `wrapChakraV2(chakraV2Fragment(...))`,
 * byte-identical to before.
 */
export function chakraV2Fragment(key: string, shades: PaletteShades): string {
  // Chakra v2 has no 950 stop, so it is dropped on the way out. The narrower
  // return shape is what makes that omission checked rather than incidental.
  const filtered: ChakraV2Shades = {
    50: shades[50],
    100: shades[100],
    200: shades[200],
    300: shades[300],
    400: shades[400],
    500: shades[500],
    600: shades[600],
    700: shades[700],
    800: shades[800],
    900: shades[900],
  };

  const entries = Object.entries(filtered)
    .map(([k, v]) => `      ${k}: '${v}',`)
    .join("\n");

  return `    ${key}: {
${entries}
    }`;
}

export function wrapChakraV2(fragment: string): string {
  return `import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
${fragment}
  }
});

export default theme;`;
}

export function exportChakraV2(
  brandKey: string,
  shades: PaletteShades
): string {
  return wrapChakraV2(chakraV2Fragment(brandKey, shades));
}
