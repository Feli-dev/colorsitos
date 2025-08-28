"use client";

import { ColorTooltip } from "@/components/color-tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ColorPalette } from "@/types/colors";
import { Copy, Download, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PaletteVisualizerProps {
  palette: ColorPalette;
}

export function PaletteVisualizer({ palette }: PaletteVisualizerProps) {
  const t = useTranslations("playground");
  const [showLabels, setShowLabels] = useState(true);
  const [viewMode, setViewMode] = useState<"bars" | "circles" | "spectrum">("bars");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadPalette = () => {
    const paletteData = {
      name: palette.name,
      colors: palette.shades.map(shade => ({
        shade: shade.value,
        hex: shade.hex,
        name: shade.name
      }))
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${palette.id}-palette.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {t("visualizer.title")}
            <span className="text-sm font-normal text-muted-foreground">
              {palette.name}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className="gap-2"
            >
              {showLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showLabels ? t("visualizer.hideLabels") : t("visualizer.showLabels")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPalette}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t("visualizer.download")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "bars" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("bars")}
          >
            {t("visualizer.modes.bars")}
          </Button>
          <Button
            variant={viewMode === "circles" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("circles")}
          >
            {t("visualizer.modes.circles")}
          </Button>
          <Button
            variant={viewMode === "spectrum" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("spectrum")}
          >
            {t("visualizer.modes.spectrum")}
          </Button>
        </div>

        <TooltipProvider>
          {/* Bars View */}
          {viewMode === "bars" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {palette.shades.map((shade) => (
                <ColorTooltip
                  key={shade.value}
                  colorValue={shade.hex}
                  showCopyIcon={false}
                  onCopy={() => copyToClipboard(shade.hex)}
                >
                  <div
                    className="group relative h-20 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: shade.hex }}
                  >
                    {showLabels && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-lg">
                        <span className="text-xs font-medium opacity-90">
                          {shade.value}
                        </span>
                        <span className="text-xs opacity-75 font-mono">
                          {shade.hex}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(shade.hex);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </ColorTooltip>
              ))}
            </div>
          )}

          {/* Circles View */}
          {viewMode === "circles" && (
            <div className="flex flex-wrap justify-center gap-6 py-8">
              {palette.shades.map((shade, index) => (
                <ColorTooltip
                  key={shade.value}
                  colorValue={shade.hex}
                  showCopyIcon={false}
                  onCopy={() => copyToClipboard(shade.hex)}
                >
                  <div
                    className="group relative w-16 h-16 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-xl ring-2 ring-white/20"
                    style={{
                      backgroundColor: shade.hex,
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {showLabels && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-lg">
                        <span className="text-xs font-medium opacity-90">
                          {shade.value}
                        </span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 rounded-full w-6 h-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(shade.hex);
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </ColorTooltip>
              ))}
            </div>
          )}

          {/* Spectrum View */}
          {viewMode === "spectrum" && (
            <div className="space-y-4">
              <div
                className="h-24 rounded-lg relative overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${palette.shades.map(s => s.hex).join(', ')})`
                }}
              >
                {showLabels && palette.shades.map((shade, index) => (
                  <div
                    key={shade.value}
                    className="absolute top-0 h-full flex items-center justify-center text-white drop-shadow-lg text-xs font-medium"
                    style={{
                      left: `${(index / (palette.shades.length - 1)) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    {shade.value}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-11 gap-2 text-center text-sm text-muted-foreground">
                {palette.shades.map((shade) => (
                  <div key={shade.value} className="space-y-1">
                    <div
                      className="h-8 rounded cursor-pointer transition-all hover:scale-105"
                      style={{ backgroundColor: shade.hex }}
                      onClick={() => copyToClipboard(shade.hex)}
                    />
                    <div className="text-xs">{shade.value}</div>
                    <div className="text-xs font-mono">{shade.hex}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}