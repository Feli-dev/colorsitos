"use client";

import { Button } from "@/components/ui/button";
import type { SavedPalette } from "@/hooks/use-saved-palettes";
import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";

const SHADE_ORDER = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

interface SavedPalettePreviewProps {
  shades: SavedPalette["shades"];
}

function SavedPalettePreview({ shades }: SavedPalettePreviewProps) {
  return (
    <div className="grid grid-cols-4 gap-1 p-1 rounded-md border bg-background">
      {SHADE_ORDER.map((value) => (
        <span
          key={value}
          className="h-4 w-4 md:h-5 md:w-5 rounded-sm"
          style={{ backgroundColor: shades[value] }}
          title={`${value}: ${shades[value]}`}
          aria-label={`shade ${value}`}
        />
      ))}
    </div>
  );
}

interface SavedPalettesProps {
  saved: SavedPalette[];
  onLoad: (palette: SavedPalette) => void;
  onDelete: (id: string) => void;
}

export function SavedPalettes({ saved, onLoad, onDelete }: SavedPalettesProps) {
  const t = useTranslations();

  if (saved.length === 0)
    return <p className="text-sm text-muted-foreground">{t("saved.empty")}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {saved.map((p) => (
        <div
          key={p.id}
          className="flex items-start justify-between gap-3 rounded-md border p-2"
        >
          <div className="shrink-0">
            <SavedPalettePreview shades={p.shades} />
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <p className="text-sm font-semibold truncate max-w-[10rem]">
              {p.name}
            </p>
            <div className="flex items-center gap-2">
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
