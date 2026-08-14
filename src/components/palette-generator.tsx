"use client";

import { ColorPaletteComponent } from "@/components/color-palette";
import { ExportersPanel } from "@/components/exporters-panel";
import { PlaygroundDrawer } from "@/components/playground-drawer";
import { SavedPalettes } from "@/components/saved-palettes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorInputWithPicker } from "@/components/ui/color-input-with-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useColorQuery } from "@/hooks/use-color-query";
import { useDynamicFavicon } from "@/hooks/use-dynamic-favicon";
import {
  useSavedPalettes,
  type SavedPalette,
} from "@/hooks/use-saved-palettes";
import { onPaletteReset } from "@/lib/palette-reset-channel";
import type { ColorPalette } from "@/types/colors";
import {
  createColorPalette,
  isValidHex,
  validateHex,
} from "@/utils/color-utils";
import { generateColorPalette } from "@/utils/palette-generator";
import { toPaletteShades } from "@/utils/palette-shades";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useIsClient } from "usehooks-ts";

// Canonical stop order used to build the palette
const SHADE_ORDER = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as const;

export function PaletteGenerator() {
  const t = useTranslations();
  const [baseHex, setBaseHex] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [palette, setPalette] = useState<ColorPalette | null>(null);
  const { saved, save, remove } = useSavedPalettes();
  const { setColorFavicon } = useDynamicFavicon();
  const isClient = useIsClient();
  const [colorFromUrl, updateColorUrl] = useColorQuery();
  // Drives the floating "create a new theme" button only. It deliberately does
  // not gate URL syncing any more; one flag doing both jobs is what kept
  // back/forward broken after loading a saved palette.
  const [loadedFromSaved, setLoadedFromSaved] = useState<boolean>(false);
  const baseHexInputRef = useRef<HTMLInputElement | null>(null);
  // The last colour this component observed in the URL, so the effect below can
  // tell a real URL change from a re-render. Starts as null rather than the
  // current value, because the colour present on first render still has to be
  // adopted — seeding it with colorFromUrl makes the first pass a no-op and the
  // form never picks up a pasted link.
  const lastUrlColor = useRef<string | null>(null);

  function toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 50);
  }

  // Updates local state and the URL together
  const handleColorChange = (newColor: string) => {
    setBaseHex(newColor);
    // An empty value clears the URL too
    if (!newColor) {
      updateColorUrl("");
    } else if (newColor !== colorFromUrl) {
      updateColorUrl(newColor);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      const raw = baseHex.trim();
      if (raw.length === 0) {
        setError("");
        setPalette(null);
        return;
      }

      const probe = raw.startsWith("#") ? raw : `#${raw}`;
      if (!isValidHex(probe)) {
        setError(t("generator.error.invalidHex"));
        setPalette(null);
        return;
      }

      try {
        const generated = generateColorPalette(probe);
        const normalized = validateHex(probe);
        const displayName = name.trim().length > 0 ? name.trim() : normalized;
        const id = toSlug(displayName || normalized) || "generada";
        const shades = SHADE_ORDER.map((v) => ({
          value: v,
          hex: generated[v],
        }));
        const colorPalette = createColorPalette(id, displayName, shades);
        setPalette(colorPalette);
        setError("");

        // Update the favicon with the base color of the palette (tone 500)
        setColorFavicon(generated[500]);
      } catch {
        setPalette(null);
        setError(t("generator.error.generate"));
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [baseHex, name, t, setColorFavicon]);

  // Reset form when logo is clicked. Clears state directly rather than going
  // through handleColorChange, so this effect does not depend on a handler that
  // is recreated every render.
  useEffect(() => {
    const handleReset = () => {
      setBaseHex("");
      updateColorUrl("");
      setName("");
      setError("");
      setPalette(null);
      setLoadedFromSaved(false);
      // Focus the input after reset
      setTimeout(() => {
        baseHexInputRef.current?.focus();
      }, 100);
    };

    return onPaletteReset(handleReset);
  }, [updateColorUrl]);

  // Adopt the colour from the URL whenever the URL itself changes: a pasted
  // link, a locale switch, or browser back/forward.
  //
  // This reacts to URL *changes* rather than to any divergence between the URL
  // and local state. Comparing the two would fight the user mid-edit, and the
  // previous guard needed loadedFromSaved to suppress it — which permanently
  // disabled back/forward, because nothing ever cleared that flag.
  useEffect(() => {
    if (colorFromUrl === lastUrlColor.current) return;
    lastUrlColor.current = colorFromUrl;

    if (colorFromUrl) setBaseHex(colorFromUrl);
  }, [colorFromUrl]);

  return (
    <div className="w-full space-y-6 h-full px-6 md:px-0">
      <Card>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="baseHex"
                className="text-sm text-muted-foreground"
              >
                {t("generator.baseHex.label")}
              </label>
              <ColorInputWithPicker
                id="baseHex"
                placeholder="#3182CE"
                value={baseHex}
                onChange={handleColorChange}
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "hex-error" : undefined}
                ref={baseHexInputRef}
                colorPickerTitle={t("generator.colorPicker.title")}
              />
              {error ? (
                <p
                  id="hex-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="paletteName"
                className="text-sm text-muted-foreground"
              >
                {t("generator.name.label")}
              </label>
              <Input
                id="paletteName"
                placeholder={t("generator.name.placeholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                inputMode="text"
                autoComplete="off"
              />
            </div>
          </div>
          {palette ? (
            <div className="space-y-4">
              <ColorPaletteComponent
                palette={palette}
                title={t("generator.generatedTitle")}
              />
              <div className="flex justify-between items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline">
                      {t("export.title")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="min-w-fit">
                    <DialogHeader>
                      <DialogTitle>{t("export.title")}</DialogTitle>
                    </DialogHeader>
                    <ExportersPanel palette={palette} />
                  </DialogContent>
                </Dialog>
                <div className="flex items-center gap-2">
                  <PlaygroundDrawer palette={palette} />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!palette) return;
                      const normalized = validateHex(
                        baseHex.trim().startsWith("#") ? baseHex : `#${baseHex}`
                      );
                      const entry: SavedPalette = {
                        id: palette.id,
                        name: palette.name,
                        baseHex: normalized,
                        shades: toPaletteShades(palette.shades),
                        createdAt: new Date().toISOString(),
                      };
                      save(entry);
                    }}
                  >
                    {t("generator.save")}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-6 text-center text-muted-foreground">
              {t("generator.preview.placeholder")}
            </div>
          )}
        </CardContent>
      </Card>

      {isClient ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("saved.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <SavedPalettes
              saved={saved}
              onLoad={(p) => {
                setName(p.name);
                handleColorChange(p.baseHex);
                setLoadedFromSaved(true);
              }}
              onDelete={(id) => remove(id)}
            />
          </CardContent>
        </Card>
      ) : null}

      {loadedFromSaved ? (
        <Button
          type="button"
          className="fixed bottom-4 left-4 h-10 shadow-lg rounded-lg"
          onClick={() => {
            setName("");
            handleColorChange("");
            setPalette(null);
            setError("");
            setLoadedFromSaved(false);
            baseHexInputRef.current?.focus();
          }}
          aria-label={t("generator.createNewTheme")}
          title={t("generator.createNewTheme")}
        >
          <Plus className="h-4 w-4" />
          {t("generator.createNewTheme")}
        </Button>
      ) : null}
    </div>
  );
}
