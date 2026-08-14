import type { PaletteShades } from "@/types/colors";

export function exportChakraV3(
  brandKey: string,
  shades: PaletteShades
): string {
  const entries = Object.entries(shades)
    .map(([k, v]) => `      ${k}: '${v}',`)
    .join("\n");

  return `import { defineStyleConfig, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  tokens: {
    colors: {
      ${brandKey}: {
${entries}
      }
    }
  }
});

export default theme;`;
}
