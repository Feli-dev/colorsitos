import type { PaletteShades } from "@/types/colors";

/**
 * Split into a fragment (one ramp's named group, no trailing comma of its
 * own) and a wrap (the one `tokens.colors` object every fragment sits
 * inside), so a whole-system export (Feature 3) can join several ramps'
 * groups with `",\n"` and wrap them once. `exportChakraV3` itself is
 * `wrapChakraV3(chakraV3Fragment(...))`, byte-identical to before.
 */
export function chakraV3Fragment(key: string, shades: PaletteShades): string {
  const entries = Object.entries(shades)
    .map(([k, v]) => `      ${k}: '${v}',`)
    .join("\n");

  return `      ${key}: {
${entries}
      }`;
}

export function wrapChakraV3(fragment: string): string {
  return `import { defineStyleConfig, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  tokens: {
    colors: {
${fragment}
    }
  }
});

export default theme;`;
}

export function exportChakraV3(
  brandKey: string,
  shades: PaletteShades
): string {
  return wrapChakraV3(chakraV3Fragment(brandKey, shades));
}
