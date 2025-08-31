"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ColorPalette } from "@/types/colors";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ColorPaletteComponent } from "../color-palette";

interface PaletteVisualizerProps {
  palette: ColorPalette;
}

export function PaletteVisualizer({ palette }: PaletteVisualizerProps) {
  const t = useTranslations("playground");
  const [showLabels] = useState(true);
  const [viewMode, setViewMode] = useState<"bars" | "spectrum">("spectrum");

  return (
    <Card>
      <CardHeader>
        {/* View Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "spectrum" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("spectrum")}
          >
            {t("visualizer.modes.spectrum")}
          </Button>
          <Button
            variant={viewMode === "bars" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("bars")}
          >
            {t("visualizer.modes.bars")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {/* Bars View */}
          {viewMode === "bars" && <ColorPaletteComponent palette={palette} />}

          {/* Spectrum View */}
          {viewMode === "spectrum" && (
            <div className="space-y-4">
              <div
                className="h-24 rounded-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${palette.shades
                    .map((s) => s.hex)
                    .join(", ")})`,
                }}
              >
                {showLabels &&
                  palette.shades.map((shade, index) => {
                    let textColor = "#ffffff";
                    const whiteValues = [
                      "300",
                      "400",
                      "500",
                      "600",
                      "700",
                      "800",
                    ];

                    if (!whiteValues.includes(String(shade.value))) {
                      const totalShades = palette.shades.length;
                      const oppositeIndex = totalShades - 1 - index;
                      textColor = palette.shades[oppositeIndex].hex;
                    }

                    return (
                      <div
                        key={shade.value}
                        className="absolute top-0 h-full flex items-center justify-center drop-shadow-lg text-xs font-medium"
                        style={{
                          left: `${
                            (index / (palette.shades.length - 1)) * 100
                          }%`,
                          color: textColor,
                          transform:
                            index === 0
                              ? "translateX(100%)"
                              : index === palette.shades.length - 1
                              ? "translateX(-150%)"
                              : "translateX(-50%)",
                        }}
                      >
                        {shade.value}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
