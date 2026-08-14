"use client";

import { ColorTooltip } from "@/components/shared/color-tooltip";
import { PlaygroundDrawer } from "@/features/playground/playground-drawer";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SavedPalette } from "@/hooks/use-saved-palettes";
import type { ColorPalette } from "@/types/colors";
import { createColorPalette } from "@/utils/color-utils";
import { Sparkles, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

const SHADE_ORDER = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

interface SavedPalettePreviewProps {
  shades: SavedPalette["shades"];
}

function SavedPalettePreview({ shades }: SavedPalettePreviewProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-4 gap-1 p-1 rounded-md border bg-gray-50 dark:bg-background">
        {SHADE_ORDER.map((value) => (
          <ColorTooltip
            key={value}
            colorValue={shades[value]}
            showCopyIcon={false}
          >
            <span
              className="h-4 w-4 md:h-5 md:w-5 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: shades[value] }}
              aria-label={`shade ${value}: ${shades[value]}`}
            />
          </ColorTooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface SavedPalettesProps {
  saved: SavedPalette[];
  onLoad: (palette: SavedPalette) => void;
  onDelete: (id: string) => void;
}

export function SavedPalettes({ saved, onLoad, onDelete }: SavedPalettesProps) {
  const t = useTranslations();

  // Convert SavedPalette to ColorPalette for playground drawer
  const convertToColorPalette = (savedPalette: SavedPalette): ColorPalette => {
    const shades = SHADE_ORDER.map((value) => ({
      value,
      hex: savedPalette.shades[value],
      name: `${savedPalette.id}-${value}`,
    }));

    return createColorPalette(savedPalette.id, savedPalette.name, shades);
  };

  if (saved.length === 0)
    return <p className="text-sm text-muted-foreground">{t("saved.empty")}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {saved.map((p) => (
        <div key={p.id} className="rounded-md border p-2">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="shrink-0">
              <SavedPalettePreview shades={p.shades} />
            </div>
            <p className="text-sm font-semibold truncate max-w-[10rem]">
              {p.name}
            </p>
            <div className="flex items-center justify-center gap-2">
              <PlaygroundDrawer
                palette={convertToColorPalette(p)}
                trigger={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t("playground.viewInAction")}
                    </span>
                  </Button>
                }
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onLoad(p)}
              >
                {t("saved.load")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-0"
                aria-label={t("saved.delete")}
                onClick={() => onDelete(p.id)}
                title={t("saved.delete")}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
