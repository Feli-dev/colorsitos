import { describe, expect, it, vi } from "vitest";

import { onPaletteReset, requestPaletteReset } from "./palette-reset-channel";

describe("palette reset channel", () => {
  it("notifies a subscriber", () => {
    const listener = vi.fn();
    const unsubscribe = onPaletteReset(listener);

    requestPaletteReset();

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("notifies every subscriber", () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribeFirst = onPaletteReset(first);
    const unsubscribeSecond = onPaletteReset(second);

    requestPaletteReset();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
    unsubscribeFirst();
    unsubscribeSecond();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = onPaletteReset(listener);

    unsubscribe();
    requestPaletteReset();

    expect(listener).not.toHaveBeenCalled();
  });

  it("leaves other subscribers alone when one unsubscribes", () => {
    const staying = vi.fn();
    const leaving = vi.fn();
    const unsubscribeStaying = onPaletteReset(staying);
    const unsubscribeLeaving = onPaletteReset(leaving);

    unsubscribeLeaving();
    requestPaletteReset();

    expect(staying).toHaveBeenCalledTimes(1);
    expect(leaving).not.toHaveBeenCalled();
    unsubscribeStaying();
  });

  it("registers the same listener only once", () => {
    const listener = vi.fn();
    const first = onPaletteReset(listener);
    const second = onPaletteReset(listener);

    requestPaletteReset();

    expect(listener).toHaveBeenCalledTimes(1);
    first();
    second();
  });

  it("is a no-op with no subscribers", () => {
    expect(() => requestPaletteReset()).not.toThrow();
  });

  it("notifies on every request, not just the first", () => {
    const listener = vi.fn();
    const unsubscribe = onPaletteReset(listener);

    requestPaletteReset();
    requestPaletteReset();
    requestPaletteReset();

    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
  });

  it("does not disturb the current pass when a listener unsubscribes during it", () => {
    let unsubscribeFirst = () => {};
    const first = vi.fn(() => unsubscribeFirst());
    const second = vi.fn();

    unsubscribeFirst = onPaletteReset(first);
    const unsubscribeSecond = onPaletteReset(second);

    requestPaletteReset();

    // Iterating a copy means removing `first` mid-pass still lets `second` run.
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);

    requestPaletteReset();

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
    unsubscribeSecond();
  });
});
