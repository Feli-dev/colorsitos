import type { ChakraV2Shades, PaletteShades } from "@/types/colors";

export function exportChakraV2(
  brandKey: string,
  shades: PaletteShades
): string {
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

  return `import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    ${brandKey}: {
${entries}
    }
  }
});

export default theme;`;
}
