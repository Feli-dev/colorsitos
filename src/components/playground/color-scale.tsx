"use client";

import { ColorTooltip } from "@/components/color-tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { ColorPalette } from "@/types/colors";
import { Copy, Download, Grid, List } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ColorScaleProps {
  palette: ColorPalette;
}

export function ColorScale({ palette }: ColorScaleProps) {
  const t = useTranslations("playground");
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [showHex, setShowHex] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportScale = () => {
    const cssVariables = palette.shades.map(shade =>
      `  --color-${palette.id}-${shade.value}: ${shade.hex};`
    ).join('\n');

    const cssContent = `:root {\n${cssVariables}\n}`;

    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(cssContent);
    const exportFileDefaultName = `${palette.id}-scale.css`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportTailwind = () => {
    const tailwindConfig = {
      theme: {
        extend: {
          colors: {
            [palette.id]: {
              ...palette.shades.reduce((acc, shade) => {
                acc[shade.value] = shade.hex;
                return acc;
              }, {} as Record<number, string>)
            }
          }
        }
      }
    };

    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(JSON.stringify(tailwindConfig, null, 2));
    const exportFileDefaultName = `${palette.id}-tailwind.json`;

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
            {t("scale.title")}
            <span className="text-sm font-normal text-muted-foreground">
              {palette.shades.length} {t("scale.shades")}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "detailed" ? "compact" : "detailed")}
              className="gap-2"
            >
              {viewMode === "detailed" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              {viewMode === "detailed" ? t("scale.view.compact") : t("scale.view.detailed")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHex(!showHex)}
              className="gap-2"
            >
              {showHex ? t("scale.hideHex") : t("scale.showHex")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportScale}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportTailwind}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Tailwind
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          {viewMode === "detailed" ? (
            /* Detailed View */
            <div className="space-y-2">
              {palette.shades.map((shade) => (
                <ColorTooltip
                  key={shade.value}
                  colorValue={shade.hex}
                  showCopyIcon={false}
                  onCopy={() => copyToClipboard(shade.hex)}
                >
                  <div
                    className="group flex items-center h-12 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                    style={{ backgroundColor: shade.hex }}
                  >
                    <div className="flex items-center justify-between w-full px-4">
                      <div className="flex items-center gap-3">
                        <div className="text-white drop-shadow-lg">
                          <span className="text-sm font-medium">
                            {shade.value}
                          </span>
                        </div>
                        {showHex && (
                          <code className="text-white/90 drop-shadow-lg text-sm font-mono bg-black/20 px-2 py-1 rounded">
                            {shade.hex}
                          </code>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(shade.hex);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </ColorTooltip>
              ))}
            </div>
          ) : (
            /* Compact View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {palette.shades.map((shade) => (
                <ColorTooltip
                  key={shade.value}
                  colorValue={shade.hex}
                  showCopyIcon={false}
                  onCopy={() => copyToClipboard(shade.hex)}
                >
                  <div
                    className="group relative aspect-square rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: shade.hex }}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white drop-shadow-lg p-2">
                      <span className="text-xs font-medium opacity-90">
                        {shade.value}
                      </span>
                      {showHex && (
                        <span className="text-xs opacity-75 font-mono">
                          {shade.hex}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 rounded-full w-6 h-6 p-0"
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

          {/* Scale Statistics */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">{t("scale.stats.title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {palette.shades.length}
                </div>
                <div className="text-muted-foreground">
                  {t("scale.stats.totalShades")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {palette.shades[0]?.hex}
                </div>
                <div className="text-muted-foreground">
                  {t("scale.stats.lightest")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {palette.shades[palette.shades.length - 1]?.hex}
                </div>
                <div className="text-muted-foreground">
                  {t("scale.stats.darkest")}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Examples */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">{t("scale.usage.title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: palette.shades.find(s => s.value === 50)?.hex,
                  borderColor: palette.shades.find(s => s.value === 200)?.hex,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <h4
                  style={{
                    color: palette.shades.find(s => s.value === 900)?.hex
                  }}
                  className="font-medium mb-2"
                >
                  {t("scale.usage.backgrounds.title")}
                </h4>
                <p
                  style={{
                    color: palette.shades.find(s => s.value === 700)?.hex
                  }}
                >
                  {t("scale.usage.backgrounds.description")}
                </p>
                <div className="mt-2 flex gap-1">
                  {[50, 100, 200].map(value => (
                    <div
                      key={value}
                      className="w-6 h-6 rounded"
                      style={{
                        backgroundColor: palette.shades.find(s => s.value === value)?.hex
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: palette.shades.find(s => s.value === 900)?.hex,
                  borderColor: palette.shades.find(s => s.value === 700)?.hex,
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <h4
                  style={{
                    color: palette.shades.find(s => s.value === 50)?.hex
                  }}
                  className="font-medium mb-2"
                >
                  {t("scale.usage.text.title")}
                </h4>
                <p
                  style={{
                    color: palette.shades.find(s => s.value === 200)?.hex
                  }}
                >
                  {t("scale.usage.text.description")}
                </p>
                <div className="mt-2 flex gap-1">
                  {[200, 700, 900].map(value => (
                    <div
                      key={value}
                      className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs"
                      style={{
                        color: palette.shades.find(s => s.value === value)?.hex
                      }}
                    >
                      T
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}