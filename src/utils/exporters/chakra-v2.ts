export type PaletteShades = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
  string
>;

export function exportChakraV2(
  brandKey: string,
  shades: Record<
    50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
    string
  >
): string {
  // Chakra v2 no utiliza 950; filtramos si existiera
  const filtered: PaletteShades = {
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
  } as const;

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
