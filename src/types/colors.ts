export interface ColorShade {
  value: number;
  hex: string;
  name: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  shades: ColorShade[];
}

export type PaletteComparison = {
  primary: ColorPalette | null;
  secondary: ColorPalette | null;
};
