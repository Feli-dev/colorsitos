"use client";

import type { PaletteShades, RampPins, RampSet } from "@/types/colors";
import { isValidHex } from "@/utils/color-utils";
import { buildRampSet } from "@/utils/ramps/build-ramp-set";
import { useLocalStorage } from "usehooks-ts";

export interface SavedPalette {
  id: string;
  name: string;
  baseHex: string;
  shades: PaletteShades;
  createdAt: string;
  /**
   * User-pinned ramp overrides (Feature 3), FLAT role -> hex (M5) -- never
   * read directly. Optional so every pre-F3 record (no `ramps` field at all)
   * stays valid; always read through `resolveRamps`, never `saved.ramps.<key>`.
   */
  ramps?: RampPins;
}

/**
 * Drops every invalid pin and, if nothing valid remains, drops the whole
 * object -- callers must persist `undefined`, not `{}`, so a zero-pin save
 * never writes a `ramps` key (M3).
 */
export function compactPins(pins?: RampPins): RampPins | undefined {
  if (!pins) return undefined;

  const validEntries = Object.entries(pins).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === "string" && isValidHex(entry[1])
  );

  return validEntries.length > 0
    ? (Object.fromEntries(validEntries) as RampPins)
    : undefined;
}

/**
 * The single accessor for a saved record's ramp data (decision 5, M5): no
 * other call site may read `saved.ramps.<key>` directly. A record with no
 * `ramps` field (M1) or a partial one (M4) both resolve through the same
 * composition root as a fresh generation, tracking the current `baseHex`.
 */
export function resolveRamps(saved: SavedPalette): RampSet {
  return buildRampSet(saved.baseHex, saved.ramps);
}

interface UseSavedPalettes {
  saved: SavedPalette[];
  save: (p: SavedPalette) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export function useSavedPalettes(
  storageKey = "colorsitos:saved-palettes"
): UseSavedPalettes {
  const [saved, setSaved] = useLocalStorage<SavedPalette[]>(storageKey, []);

  function save(palette: SavedPalette) {
    const { ramps: rawPins, ...core } = palette;
    const ramps = compactPins(rawPins);
    const record: SavedPalette = ramps ? { ...core, ramps } : core;

    setSaved((prev) => {
      const without = prev.filter((x) => x.id !== palette.id);
      return [...without, record].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  function remove(id: string) {
    setSaved((prev) => prev.filter((x) => x.id !== id));
  }

  function clear() {
    setSaved([]);
  }

  return { saved, save, remove, clear };
}
