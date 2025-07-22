"use client";

import { ColorPaletteComponent } from "@/components/color-palette";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colorPalettes } from "@/data/palettes";
import { PaletteComparison } from "@/types/colors";
import { useState } from "react";

export function PaletteComparator() {
  const [comparison, setComparison] = useState<PaletteComparison>({
    primary: null,
    secondary: null,
  });

  const handlePrimaryChange = (paletteId: string) => {
    const palette = colorPalettes.find((p) => p.id === paletteId);
    setComparison((prev) => ({
      ...prev,
      primary: palette || null,
    }));
  };

  const handleSecondaryChange = (paletteId: string) => {
    const palette = colorPalettes.find((p) => p.id === paletteId);
    setComparison((prev) => ({
      ...prev,
      secondary: palette || null,
    }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Palette Selector */}
            <div className="space-y-3">
              <Select onValueChange={handlePrimaryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una paleta" />
                </SelectTrigger>
                <SelectContent>
                  {colorPalettes.map((palette) => (
                    <SelectItem key={palette.id} value={palette.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: palette.shades[5].hex }}
                        />
                        {palette.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secondary Palette Selector */}
            <div className="space-y-3">
              <Select onValueChange={handleSecondaryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una paleta" />
                </SelectTrigger>
                <SelectContent>
                  {colorPalettes.map((palette) => (
                    <SelectItem key={palette.id} value={palette.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: palette.shades[5].hex }}
                        />
                        {palette.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Palettes Display */}
      {(comparison.primary || comparison.secondary) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Palette */}
          <div className="space-y-4">
            {comparison.primary ? (
              <ColorPaletteComponent
                palette={comparison.primary}
                title="Principal"
                position="left"
              />
            ) : (
              <Card className="w-full">
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">
                    Selecciona otra paleta
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Secondary Palette */}
          <div className="space-y-4">
            {comparison.secondary ? (
              <ColorPaletteComponent
                palette={comparison.secondary}
                title="Secundaria"
                position="right"
              />
            ) : (
              <Card className="w-full">
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">
                    Selecciona otra paleta
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Instructions when no palettes selected */}
      {!comparison.primary && !comparison.secondary && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="space-y-4">
              <p className="text-muted-foreground max-w-md mx-auto">
                Selecciona una o dos paletas usando los selectores de arriba
                para ver y comparar todos sus tonos del 50 al 900.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
