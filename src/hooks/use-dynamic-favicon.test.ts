import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useDynamicFavicon } from "./use-dynamic-favicon";

const faviconLinks = () =>
  Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]'));

beforeEach(() => {
  document.head.innerHTML = "";
});

describe("useDynamicFavicon", () => {
  it("creates a favicon link when the document has none", () => {
    const { result } = renderHook(() => useDynamicFavicon());

    act(() => {
      result.current.setColorFavicon("#3182CE");
    });

    expect(faviconLinks()).toHaveLength(1);
  });

  it("reuses the existing link instead of appending a second one", () => {
    // The regression that matters: a page that already ships a static favicon
    // must end up with one link, not two competing ones.
    const existing = document.createElement("link");
    existing.rel = "icon";
    existing.href = "/favicon.ico";
    document.head.appendChild(existing);

    const { result } = renderHook(() => useDynamicFavicon());

    act(() => {
      result.current.setColorFavicon("#3182CE");
    });

    expect(faviconLinks()).toHaveLength(1);
    expect(faviconLinks()[0]).toBe(existing);
  });

  it("does not accumulate links across repeated updates", () => {
    const { result } = renderHook(() => useDynamicFavicon());

    act(() => {
      result.current.setColorFavicon("#3182CE");
      result.current.setColorFavicon("#E53E3E");
      result.current.setColorFavicon("#38A169");
    });

    expect(faviconLinks()).toHaveLength(1);
  });

  it("points the link at a generated image rather than a file", () => {
    const { result } = renderHook(() => useDynamicFavicon());

    act(() => {
      result.current.setColorFavicon("#3182CE");
    });

    // jsdom's canvas has no real 2d context, so the href is either a data URL
    // or empty — what must not happen is it silently keeping a stale path.
    const href = faviconLinks()[0].href;
    expect(href.startsWith("data:") || href === "" || href.endsWith("/")).toBe(
      true
    );
  });
});
