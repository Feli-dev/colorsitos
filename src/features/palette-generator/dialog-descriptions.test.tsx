import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ColorPalette } from "@/types/colors";
import { ColorInputWithPicker } from "./color-input-with-picker";
import { ImageColorPicker } from "./image-color-picker";
import { PaletteGenerator } from "./palette-generator";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/features/playground/playground-drawer", () => ({
  PlaygroundDrawer: () => null,
}));

vi.mock("@/features/palette-generator/exporters-panel", () => ({
  ExportersPanel: () => <div data-testid="exporters" />,
}));

afterEach(() => vi.restoreAllMocks());

/** The dialog must point at a description element that actually has text. */
function expectDescribed(dialog: HTMLElement) {
  const id = dialog.getAttribute("aria-describedby");
  expect(id).toBeTruthy();
  expect(document.getElementById(id!)?.textContent?.trim()).toBeTruthy();
}

/** Radix reports a missing description through console.warn. */
function spyOnWarnings() {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  return () =>
    [...warn.mock.calls, ...error.mock.calls].filter((args) =>
      String(args[0]).includes("Description")
    );
}

describe("dialogs are described for assistive tech", () => {
  it("color picker dialog", async () => {
    const descriptionWarnings = spyOnWarnings();
    render(<ColorInputWithPicker value="#3182CE" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Open color picker" })
    );

    expectDescribed(await screen.findByRole("dialog"));
    expect(descriptionWarnings()).toHaveLength(0);
  });

  it("image color picker dialog", async () => {
    const descriptionWarnings = spyOnWarnings();
    render(<ImageColorPicker open onOpenChange={vi.fn()} />);

    expectDescribed(await screen.findByRole("dialog"));
    expect(descriptionWarnings()).toHaveLength(0);
  });

  it("export dialog", async () => {
    const descriptionWarnings = spyOnWarnings();
    render(
      <NuqsTestingAdapter
        searchParams="?color=3182CE"
        resetUrlUpdateQueueOnMount={false}
      >
        <PaletteGenerator />
      </NuqsTestingAdapter>
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "export.title" }, { timeout: 2000 })
    );

    expectDescribed(await screen.findByRole("dialog"));
    expect(descriptionWarnings()).toHaveLength(0);
  });
});

describe("playground drawer", () => {
  it("is described", async () => {
    const actual = await vi.importActual<
      typeof import("@/features/playground/playground-drawer")
    >("@/features/playground/playground-drawer");
    const palette: ColorPalette = { id: "p", name: "P", shades: [] };
    const descriptionWarnings = spyOnWarnings();
    render(<actual.PlaygroundDrawer palette={palette} />);
    await userEvent.click(
      screen.getByRole("button", { name: /viewInAction/ })
    );

    await waitFor(() => expectDescribed(screen.getByRole("dialog")));
    expect(descriptionWarnings()).toHaveLength(0);
  });
});
