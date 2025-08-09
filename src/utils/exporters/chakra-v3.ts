export type PaletteShades = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  string
>;

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
