import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useSavedPalettes, type SavedPalette } from "./use-saved-palettes";

const STORAGE_KEY = "colorsitos:saved-palettes";

const makePalette = (
  id: string,
  name: string,
  overrides: Partial<SavedPalette> = {}
): SavedPalette => ({
  id,
  name,
  baseHex: "#3182CE",
  shades: {
    50: "#EBF8FF",
    100: "#BEE3F8",
    200: "#90CDF4",
    300: "#63B3ED",
    400: "#4299E1",
    500: "#3182CE",
    600: "#2B6CB0",
    700: "#2C5282",
    800: "#2A4365",
    900: "#1A365D",
    950: "#102A4C",
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const readStorage = (key = STORAGE_KEY): SavedPalette[] =>
  JSON.parse(window.localStorage.getItem(key) ?? "[]");

describe("useSavedPalettes", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty when nothing is stored", () => {
    const { result } = renderHook(() => useSavedPalettes());

    expect(result.current.saved).toEqual([]);
  });

  it("hydrates from localStorage", () => {
    const stored = makePalette("a", "Ocean");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([stored]));

    const { result } = renderHook(() => useSavedPalettes());

    expect(result.current.saved).toEqual([stored]);
  });

  it("persists a saved palette under the default key", () => {
    const { result } = renderHook(() => useSavedPalettes());
    const palette = makePalette("a", "Ocean");

    act(() => result.current.save(palette));

    expect(result.current.saved).toEqual([palette]);
    expect(readStorage()).toEqual([palette]);
  });

  it("keeps palettes sorted by name", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("c", "Zinc")));
    act(() => result.current.save(makePalette("a", "Amber")));
    act(() => result.current.save(makePalette("b", "Mint")));

    expect(result.current.saved.map((p) => p.name)).toEqual([
      "Amber",
      "Mint",
      "Zinc",
    ]);
  });

  it("replaces an existing palette instead of duplicating it", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("a", "Ocean")));
    act(() =>
      result.current.save(makePalette("a", "Ocean", { baseHex: "#E53E3E" }))
    );

    expect(result.current.saved).toHaveLength(1);
    expect(result.current.saved[0].baseHex).toBe("#E53E3E");
  });

  it("removes only the requested id", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("a", "Amber")));
    act(() => result.current.save(makePalette("b", "Mint")));
    act(() => result.current.remove("a"));

    expect(result.current.saved.map((p) => p.id)).toEqual(["b"]);
    expect(readStorage().map((p) => p.id)).toEqual(["b"]);
  });

  it("ignores removal of an unknown id", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("a", "Amber")));
    act(() => result.current.remove("does-not-exist"));

    expect(result.current.saved).toHaveLength(1);
  });

  it("clears every palette", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("a", "Amber")));
    act(() => result.current.save(makePalette("b", "Mint")));
    act(() => result.current.clear());

    expect(result.current.saved).toEqual([]);
    expect(readStorage()).toEqual([]);
  });

  it("isolates palettes stored under a custom key", () => {
    const { result } = renderHook(() => useSavedPalettes("custom:key"));

    act(() => result.current.save(makePalette("a", "Amber")));

    expect(readStorage("custom:key")).toHaveLength(1);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
