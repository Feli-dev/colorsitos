"use client";

import { useLocalStorage } from "usehooks-ts";

export interface SavedPalette {
  id: string;
  name: string;
  baseHex: string;
  shades: Record<
    50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
    string
  >;
  createdAt: string;
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
    setSaved((prev) => {
      const without = prev.filter((x) => x.id !== palette.id);
      return [...without, palette].sort((a, b) => a.name.localeCompare(b.name));
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
