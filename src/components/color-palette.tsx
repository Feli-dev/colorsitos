import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPalette } from "@/types/colors";
import { isLightColor } from "@/utils/color-utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ColorPaletteProps {
  palette: ColorPalette;
  title?: string;
  position?: "left" | "right";
}

export function ColorPaletteComponent({
  palette,
  title,
  position = "left",
}: ColorPaletteProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error("Error al copiar el color:", err);
    }
  };

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
                {/* Color swatch principal */}
                <div
                  className="w-full h-24 flex items-center justify-center relative cursor-pointer"
                  style={{ backgroundColor: shade.hex }}
                  onClick={() => handleCopyColor(shade.hex)}
                >
                  {/* Botón de copiar - aparece solo en hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyColor(shade.hex);
                      }}
                      className="h-8 w-8 p-0 shadow-md"
                      title="Copiar código hex"
                    >
                      {isCopied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Información del color en la parte inferior */}
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
