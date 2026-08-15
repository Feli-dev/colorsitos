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

/**
 * jsdom ships no matchMedia at all, so `useMediaQuery` throws on mount — which
 * takes down anything rendering the image picker, and with it the whole
 * generator tree.
 *
 * Always reports "does not match". That is the desktop, fine-pointer branch,
 * which is the one the assertions are written against; a test that cares about
 * the coarse-pointer branch should stub matchMedia itself rather than flip this
 * default for everyone.
 */
if (!globalThis.window.matchMedia) {
  globalThis.window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

afterEach(() => {
  cleanup();
});
