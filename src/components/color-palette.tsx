import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPalette } from "@/types/colors";
import { isLightColor } from "@/utils/color-utils";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ColorPaletteProps {
  palette: ColorPalette;
  title?: string;
  position?: "left" | "right";
  layout?: "list" | "inline"; // list: tarjetas verticales; inline: fila de swatches
}

export function ColorPaletteComponent({
  palette,
  title,
  position = "left",
  layout = "list",
}: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const t = useTranslations();

  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error(t("palette.copy.error"), err);
    }
  };

  if (layout === "inline") {
    return (
      <Card className="w-full">
        <CardContent>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {palette.shades.map((shade) => {
              const isLight = isLightColor(shade.hex);
              const isCopied = copiedColor === shade.hex;

              return (
                <div
                  key={shade.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleCopyColor(shade.hex)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCopyColor(shade.hex);
                    }
                  }}
                  className="relative group w-full rounded-xl border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring overflow-hidden"
                  title={`${shade.value} ${shade.hex}`}
                  aria-label={`${shade.value} ${shade.hex}`}
                >
                  {/* Swatch de color */}
                  <div
                    className="h-20 w-full"
                    style={{ backgroundColor: shade.hex }}
                  />

                  {/* Footer blanco con hex y valor */}
                  <div className="p-2 bg-background">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs md:text-sm">
                        {shade.hex}
                      </span>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] md:text-xs"
                      >
                        {shade.value}
                      </Badge>
                    </div>
                  </div>

                  {/* Botón copiar sobre el swatch (hover) */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant={isLight ? "secondary" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyColor(shade.hex);
                      }}
                      className="h-7 w-7 p-0"
                      title={t("palette.copy.title")}
                      aria-label={t("palette.copy.title")}
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 justify-start`}>
          {title && (
            <span className="text-sm text-muted-foreground">{title}:</span>
          )}
          {palette.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {palette.shades.map((shade) => {
            const isLight = isLightColor(shade.hex);
            const textColor = isLight ? "text-gray-900" : "text-white";
            const isCopied = copiedColor === shade.hex;

            return (
              <div
                key={shade.value}
                className="relative group rounded-lg border overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div
                  className="w-full h-24 flex items-center justify-center relative cursor-pointer"
                  style={{ backgroundColor: shade.hex }}
                  onClick={() => handleCopyColor(shade.hex)}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyColor(shade.hex);
                      }}
                      className="h-8 w-8 p-0 shadow-md"
                      title={t("palette.copy.title")}
                      aria-label={t("palette.copy.title")}
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{shade.hex}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shade.value}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
