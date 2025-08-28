"use client";

import { PaletteVisualizer } from "@/components/playground/palette-visualizer";
import { ColorShowcase } from "@/components/playground/color-showcase";
import { ColorScale } from "@/components/playground/color-scale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorInputWithPicker } from "@/components/ui/color-input-with-picker";
import { useColorQuery } from "@/hooks/use-color-query";
import { useDynamicFavicon } from "@/hooks/use-dynamic-favicon";
import type { ColorPalette } from "@/types/colors";
import {
  createColorPalette,
  isValidHex,
  validateHex,
} from "@/utils/color-utils";
import { generateColorPalette } from "@/utils/palette-generator";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

// Orden canónico de tonos para generar la paleta
const SHADE_ORDER = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export default function PlaygroundPage() {
  const t = useTranslations("playground");
  const [baseHex, setBaseHex] = useState<string>("");
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const { setColorFavicon } = useDynamicFavicon();
  const [colorFromUrl, updateColorUrl] = useColorQuery();

  // Handler para actualizar el color base
  const handleColorChange = (newColor: string) => {
    setBaseHex(newColor);
    if (!newColor) {
      updateColorUrl("");
    } else if (newColor !== colorFromUrl) {
      updateColorUrl(newColor);
    }
  };

  // Generar paleta cuando cambia el color base
  useEffect(() => {
    const handle = setTimeout(() => {
      const raw = baseHex.trim();
      if (raw.length === 0) {
        setPalette(null);
        return;
      }

      const probe = raw.startsWith("#") ? raw : `#${raw}`;
      if (!isValidHex(probe)) {
        setPalette(null);
        return;
      }

      try {
        const generated = generateColorPalette(probe);
        const normalized = validateHex(probe);
        const displayName = `Palette ${normalized}`;
        const id = `palette-${normalized.toLowerCase().replace('#', '')}`;
        const shades = SHADE_ORDER.map((v) => ({
          value: v,
          hex: generated[v],
        }));
        const colorPalette = createColorPalette(id, displayName, shades);
        setPalette(colorPalette);

        // Update the favicon with the base color of the palette (tone 500)
        setColorFavicon(generated[500]);
      } catch {
        setPalette(null);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [baseHex, setColorFavicon]);

  // Load color from URL query parameter
  useEffect(() => {
    if (colorFromUrl && colorFromUrl !== baseHex) {
      setBaseHex(colorFromUrl);
    }
  }, [colorFromUrl]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      {/* Color Input */}
      <Card>
        <CardHeader>
          <CardTitle>{t("colorInput.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="playgroundHex"
                className="text-sm text-muted-foreground"
              >
                {t("colorInput.label")}
              </label>
              <ColorInputWithPicker
                id="playgroundHex"
                placeholder="#3182CE"
                value={baseHex}
                onChange={handleColorChange}
                colorPickerTitle={t("colorInput.pickerTitle")}
              />
            </div>
            {palette && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange("#3182CE")}
                >
                  {t("presets.blue")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange("#10B981")}
                >
                  {t("presets.green")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange("#F59E0B")}
                >
                  {t("presets.amber")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange("#EF4444")}
                >
                  {t("presets.red")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorChange("#8B5CF6")}
                >
                  {t("presets.purple")}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {palette ? (
        <>
          {/* Palette Visualizer */}
          <PaletteVisualizer palette={palette} />

          {/* Color Showcase */}
          <ColorShowcase palette={palette} />

          {/* Color Scale */}
          <ColorScale palette={palette} />
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground space-y-4">
              <div className="text-6xl">🎨</div>
              <p>{t("placeholder")}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}