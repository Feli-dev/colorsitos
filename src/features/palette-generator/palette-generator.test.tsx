import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type UrlUpdateEvent } from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { requestPaletteReset } from "@/lib/palette-reset-channel";
import { PaletteGenerator } from "./palette-generator";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

/*
  The drawer and the export dialog only appear once a palette exists, and both
  pull in primitives that measure themselves. Nothing here asserts on either, so
  they are stubbed down to a marker: the point is that the generator hands them
  a palette, not what they do with it.
*/
vi.mock("@/features/playground/playground-drawer", () => ({
  PlaygroundDrawer: () => <div data-testid="playground" />,
}));

vi.mock("@/features/palette-generator/exporters-panel", () => ({
  ExportersPanel: () => <div data-testid="exporters" />,
}));

const BLUE = "#3182CE";
const RED = "#E53E3E";

/**
 * Renders the generator under a real nuqs adapter.
 *
 * The returned `navigate` re-renders with a different query string, which is
 * how the adapter models a URL change arriving from outside the component —
 * browser back/forward, or a locale switch. Without it there is no way to tell
 * "the component wrote the URL" apart from "the component read it".
 */
function renderWith(
  searchParams: string,
  onUrlUpdate?: (e: UrlUpdateEvent) => void
) {
  const tree = (search: string) => (
    <NuqsTestingAdapter
      searchParams={search}
      onUrlUpdate={onUrlUpdate}
      resetUrlUpdateQueueOnMount={false}
    >
      <PaletteGenerator />
    </NuqsTestingAdapter>
  );

  const result = render(tree(searchParams));

  return {
    ...result,
    navigate: (search: string) => result.rerender(tree(search)),
  };
}

const hexInput = () => screen.getByLabelText("generator.baseHex.label");

/** The palette only appears after the 350ms debounce, so every assertion on it waits. */
const palette = () =>
  waitFor(() => screen.getByText("generator.generatedTitle"), { timeout: 2000 });

beforeEach(() => {
  window.localStorage.clear();
});

describe("PaletteGenerator URL sync", () => {
  it("adopts a colour that is already in the URL on first render", async () => {
    // The regression this exists for: seeding the "last seen URL colour" ref
    // with the current value made the first pass a no-op, so a pasted link
    // rendered an empty form. Typecheck and the whole suite stayed green.
    renderWith(`?color=${BLUE.slice(1)}`);

    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));
    expect(await palette()).toBeInTheDocument();
  });

  it("ignores a malformed colour in the URL", async () => {
    renderWith("?color=nothex");

    await waitFor(() => expect(hexInput()).toHaveValue(""));
    expect(screen.getByText("generator.preview.placeholder")).toBeInTheDocument();
  });

  it("writes what the user types back to the URL", async () => {
    const updates: UrlUpdateEvent[] = [];
    renderWith("", (e) => updates.push(e));

    await userEvent.type(hexInput(), BLUE);

    await waitFor(() =>
      expect(updates.at(-1)?.searchParams.get("color")).toBe(BLUE.slice(1))
    );
  });

  it("drops the parameter entirely when the field is cleared", async () => {
    const updates: UrlUpdateEvent[] = [];
    renderWith(`?color=${BLUE.slice(1)}`, (e) => updates.push(e));

    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));
    await userEvent.clear(hexInput());

    // An empty value has to remove `color`, not park an empty one in the URL.
    await waitFor(() =>
      expect(updates.at(-1)?.searchParams.get("color")).toBeNull()
    );
  });

  it("keeps following the URL after a saved palette is loaded", async () => {
    // `loadedFromSaved` used to gate URL syncing as well as the floating
    // button, and nothing ever cleared it — so loading a saved palette
    // permanently disabled back/forward. It now drives the button only.
    window.localStorage.setItem(
      "colorsitos:saved-palettes",
      JSON.stringify([
        {
          id: "saved-one",
          name: "Saved One",
          baseHex: RED,
          shades: {
            50: "#FBEEEE",
            100: "#F8DCDC",
            200: "#F3BCBC",
            300: "#EE9696",
            400: "#EB7070",
            500: RED,
            600: "#B83030",
            700: "#8A2222",
            800: "#631515",
            900: "#3B0909",
            950: "#280404",
          },
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ])
    );

    const updates: UrlUpdateEvent[] = [];
    const { navigate } = renderWith("", (e) => updates.push(e));

    await userEvent.click(await screen.findByText("saved.load"));

    await waitFor(() => expect(hexInput()).toHaveValue(RED));
    await waitFor(() =>
      expect(updates.at(-1)?.searchParams.get("color")).toBe(RED.slice(1))
    );

    // Back/forward: the URL changes from outside. This is the assertion the
    // old gate broke — writing still worked, so only an inbound change
    // distinguishes a live subscription from a dead one.
    navigate(`?color=${BLUE.slice(1)}`);

    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));
  });

  it("follows back/forward without a saved palette in play", async () => {
    const { navigate } = renderWith(`?color=${BLUE.slice(1)}`);

    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));

    navigate(`?color=${RED.slice(1)}`);
    await waitFor(() => expect(hexInput()).toHaveValue(RED));

    navigate(`?color=${BLUE.slice(1)}`);
    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));
  });
});

describe("PaletteGenerator reset channel", () => {
  it("clears the form and the URL when a reset is broadcast", async () => {
    const updates: UrlUpdateEvent[] = [];
    renderWith(`?color=${BLUE.slice(1)}`, (e) => updates.push(e));

    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));
    expect(await palette()).toBeInTheDocument();

    requestPaletteReset();

    await waitFor(() => expect(hexInput()).toHaveValue(""));
    await waitFor(() =>
      expect(screen.getByText("generator.preview.placeholder")).toBeInTheDocument()
    );
    expect(updates.at(-1)?.searchParams.get("color")).toBeNull();
  });

  it("stops listening once unmounted", async () => {
    const { unmount } = renderWith(`?color=${BLUE.slice(1)}`);

    await waitFor(() => expect(hexInput()).toHaveValue(BLUE));
    unmount();

    // A leaked subscriber would set state on an unmounted tree here.
    expect(() => requestPaletteReset()).not.toThrow();
  });
});

describe("PaletteGenerator validation", () => {
  it("reports an invalid hex instead of rendering a palette", async () => {
    renderWith("");

    await userEvent.type(hexInput(), "#zzzzzz");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "generator.error.invalidHex"
    );
    expect(screen.queryByText("generator.generatedTitle")).not.toBeInTheDocument();
  });

  it("accepts a hex typed without the leading hash", async () => {
    renderWith("");

    await userEvent.type(hexInput(), "3182CE");

    expect(await palette()).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
