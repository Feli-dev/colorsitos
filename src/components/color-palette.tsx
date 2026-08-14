import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColorPalette } from "@/types/colors";
import { isLightColor } from "@/utils/color-utils";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ColorPaletteProps {
  palette: ColorPalette;
  /** Optional heading above the swatch grid. Omit it to render no heading. */
  title?: string;
}

export function ColorPaletteComponent({ palette, title }: ColorPaletteProps) {
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

  return (
    <div className="w-full space-y-2">
      {title ? (
        // Same type scale as the field labels in this card, so the heading reads
        // as part of the existing form rather than a new visual element.
        <h2 className="text-sm text-muted-foreground">{title}</h2>
      ) : null}
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
              <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
    </div>
  );
}
