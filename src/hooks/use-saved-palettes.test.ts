import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { RampPins } from "@/types/colors";
import { buildRampSet } from "@/utils/ramps/build-ramp-set";
import {
  compactPins,
  resolveRamps,
  useSavedPalettes,
  type SavedPalette,
} from "./use-saved-palettes";

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

describe("resolveRamps — M1, M4 (single accessor, decision 5)", () => {
  it("M1: a pre-F3 record with no `ramps` field fully derives, byte-for-byte", () => {
    const legacy = makePalette("a", "Ocean"); // no `ramps` field at all
    expect(resolveRamps(legacy)).toEqual(buildRampSet(legacy.baseHex));
  });

  it("M4: a record with only accent pinned derives every other role", () => {
    const pins: RampPins = { accent: "#00FF00" };
    const partial = makePalette("a", "Ocean", { ramps: pins });

    const resolved = resolveRamps(partial);

    expect(resolved.accent.origin).toBe("pinned");
    expect(resolved.accent.baseHex).toBe("#00FF00");
    expect(resolved.neutral.origin).toBe("derived");
    expect(resolved.success.origin).toBe("derived");
    expect(resolved.warning.origin).toBe("derived");
    expect(resolved.danger.origin).toBe("derived");
  });

  it("derived ramps track the brand indefinitely -- not snapshotted at save time", () => {
    const withOldBrand = makePalette("a", "Ocean", { baseHex: "#3182CE" });
    const withNewBrand = makePalette("a", "Ocean", { baseHex: "#E53E3E" });

    expect(resolveRamps(withNewBrand).accent.baseHex).not.toBe(
      resolveRamps(withOldBrand).accent.baseHex
    );
  });
});

describe("compactPins — M3 (zero-pin save omits the ramps key)", () => {
  it("returns undefined for undefined input", () => {
    expect(compactPins(undefined)).toBeUndefined();
  });

  it("returns undefined for an empty pins object", () => {
    expect(compactPins({})).toBeUndefined();
  });

  it("keeps only valid-hex entries", () => {
    const pins = { accent: "#00FF00", danger: "not-a-hex" } as RampPins;
    expect(compactPins(pins)).toEqual({ accent: "#00FF00" });
  });
});

describe("useSavedPalettes — M2, M3 (ramps field persistence)", () => {
  it("M3: saving with an explicit empty pins object writes no `ramps` key at all", () => {
    // The UI always passes the current pins from useRampPinsQuery, which is
    // `{}` (not absent) when the user has pinned nothing -- compactPins must
    // still drop the key, not persist an empty object.
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("a", "Ocean", { ramps: {} })));

    const [entry] = readStorage();
    expect("ramps" in entry).toBe(false);
  });

  it("M3: saving with no `ramps` field given at all also writes no `ramps` key", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() => result.current.save(makePalette("a", "Ocean")));

    const [entry] = readStorage();
    expect("ramps" in entry).toBe(false);
  });

  it("M2: id/name/baseHex/shades/createdAt survive a save with one ramp pinned", () => {
    const { result } = renderHook(() => useSavedPalettes());
    const original = makePalette("a", "Ocean");

    act(() =>
      result.current.save({ ...original, ramps: { accent: "#00FF00" } })
    );

    const [entry] = readStorage();
    expect(entry.id).toBe(original.id);
    expect(entry.name).toBe(original.name);
    expect(entry.baseHex).toBe(original.baseHex);
    expect(entry.shades).toEqual(original.shades);
    expect(entry.createdAt).toBe(original.createdAt);
  });

  it("persists a non-empty ramps object when a valid pin is given", () => {
    const { result } = renderHook(() => useSavedPalettes());

    act(() =>
      result.current.save(
        makePalette("a", "Ocean", { ramps: { danger: "#AA0000" } })
      )
    );

    const [entry] = readStorage();
    expect(entry.ramps).toEqual({ danger: "#AA0000" });
  });

  it("M6: unparseable localStorage still degrades to [] without throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not valid json");

    const { result } = renderHook(() => useSavedPalettes());

    expect(result.current.saved).toEqual([]);
  });
});
