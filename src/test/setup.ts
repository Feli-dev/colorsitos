import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * jsdom implements neither of these, and Radix primitives that measure
 * themselves — Slider, Progress, Select — throw on mount without them.
 *
 * Stubs rather than polyfills: nothing under test asserts on observed sizes,
 * so the observers only need to exist and stay quiet.
 */
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (!globalThis.Element.prototype.hasPointerCapture) {
  globalThis.Element.prototype.hasPointerCapture = () => false;
  globalThis.Element.prototype.setPointerCapture = () => {};
  globalThis.Element.prototype.releasePointerCapture = () => {};
}

if (!globalThis.Element.prototype.scrollIntoView) {
  globalThis.Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
});
