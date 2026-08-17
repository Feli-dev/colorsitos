import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ColorPalette } from "@/types/colors";
import { ExportersPanel } from "./exporters-panel";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const palette: ColorPalette = {
  id: "brand",
  name: "Brand",
  shades: [
    { value: 50, hex: "#EBF8FF", name: "brand-50" },
    { value: 100, hex: "#BEE3F8", name: "brand-100" },
    { value: 200, hex: "#90CDF4", name: "brand-200" },
    { value: 300, hex: "#63B3ED", name: "brand-300" },
    { value: 400, hex: "#4299E1", name: "brand-400" },
    { value: 500, hex: "#3182CE", name: "brand-500" },
    { value: 600, hex: "#2B6CB0", name: "brand-600" },
    { value: 700, hex: "#2C5282", name: "brand-700" },
    { value: 800, hex: "#2A4365", name: "brand-800" },
    { value: 900, hex: "#1A365D", name: "brand-900" },
    { value: 950, hex: "#102A4C", name: "brand-950" },
  ],
};

/** The rendered code block — the panel's only real output. */
const code = () => screen.getByRole("code");

const lines = () => code().textContent!.trim().split("\n");

/**
 * Picks an export kind from the Radix Select.
 *
 * This is the interaction browser automation cannot reach — the listbox is
 * portalled and its items are not real options — so a component test is the
 * only place this path gets exercised at all.
 */
async function chooseExport(label: string) {
  const trigger = screen.getByRole("combobox");
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("option", { name: label }));
}

describe("ExportersPanel format switching", () => {
  it("starts on hex with one line per stop", () => {
    render(<ExportersPanel palette={palette} />);

    expect(lines()).toHaveLength(11);
    expect(lines()[0]).toBe("#EBF8FF");
    expect(lines()[10]).toBe("#102A4C");
  });

  it("re-renders every stop when RGB is picked", async () => {
    render(<ExportersPanel palette={palette} />);

    await userEvent.click(screen.getByRole("button", { name: "RGB" }));

    // All eleven, not just the first — a memo keyed on the wrong dependency
    // would leave some stops behind in the old format.
    await waitFor(() => expect(lines()[0]).toMatch(/^rgb\(/));
    expect(lines()).toHaveLength(11);
    expect(lines().every((line) => line.startsWith("rgb("))).toBe(true);
  });

  it("re-renders every stop when HSL is picked", async () => {
    render(<ExportersPanel palette={palette} />);

    await userEvent.click(screen.getByRole("button", { name: "HSL" }));

    await waitFor(() => expect(lines()[0]).toMatch(/^hsl\(/));
    expect(lines().every((line) => line.startsWith("hsl("))).toBe(true);
  });

  it("re-renders every stop when OKLCH is picked", async () => {
    render(<ExportersPanel palette={palette} />);

    await userEvent.click(screen.getByRole("button", { name: "OKLCH" }));

    await waitFor(() => expect(lines()[0]).toMatch(/^oklch\(/));
    expect(lines().every((line) => line.startsWith("oklch("))).toBe(true);
  });

  it("returns to hex after switching away and back", async () => {
    render(<ExportersPanel palette={palette} />);

    await userEvent.click(screen.getByRole("button", { name: "OKLCH" }));
    await waitFor(() => expect(lines()[0]).toMatch(/^oklch\(/));

    await userEvent.click(screen.getByRole("button", { name: "Hex" }));
    await waitFor(() => expect(lines()[0]).toBe("#EBF8FF"));
  });
});

describe("ExportersPanel export kinds", () => {
  it("switches to a Tailwind v4 theme block", async () => {
    render(<ExportersPanel palette={palette} />);

    await chooseExport("Tailwind v4");

    await waitFor(() => expect(code()).toHaveTextContent("--color-brand-500"));
    // On :root instead of @theme this is valid CSS that generates no
    // utilities at all, which is what #69 was.
    expect(code().textContent).toContain("@theme");
    expect(code().textContent).not.toContain(":root");
    expect(code().textContent).toContain("bg-brand-500");
  });

  it("offers plain CSS variables as their own export", async () => {
    render(<ExportersPanel palette={palette} />);

    await chooseExport("CSS Variables");

    // The `:root` output the Tailwind option used to give, kept under a name
    // that does not promise Tailwind utilities.
    await waitFor(() => expect(code()).toHaveTextContent("--brand-500"));
    expect(code().textContent).toContain(":root");
    expect(code().textContent).not.toContain("@theme");
    expect(code().textContent).not.toContain("--color-");
  });

  it("carries the chosen format into a framework export", async () => {
    render(<ExportersPanel palette={palette} />);

    await userEvent.click(screen.getByRole("button", { name: "RGB" }));
    await chooseExport("Tailwind v3");

    // Format and kind are separate pieces of state; picking a framework must
    // not silently reset the colour notation back to hex.
    await waitFor(() => expect(code().textContent).toMatch(/rgb\(/));
    expect(code().textContent).not.toMatch(/#EBF8FF/i);
  });

  it("renames the palette key from the brand field", async () => {
    render(<ExportersPanel palette={palette} />);

    await chooseExport("Tailwind v4");
    await waitFor(() => expect(code()).toHaveTextContent("--color-brand-500"));

    const brandField = screen.getByLabelText("export.brandKey");
    await userEvent.clear(brandField);
    await userEvent.type(brandField, "acme");

    await waitFor(() => expect(code()).toHaveTextContent("--color-acme-500"));
  });

  it("switches to a shadcn/ui theme with light and dark blocks", async () => {
    render(<ExportersPanel palette={palette} />);

    await chooseExport("shadcn/ui");

    await waitFor(() => expect(code()).toHaveTextContent("--primary:"));
    expect(code().textContent).toContain(":root {");
    expect(code().textContent).toContain(".dark {");
    expect(code().textContent).not.toContain("--destructive-foreground");
  });

  it("hides the brand field on the bare codes export", async () => {
    render(<ExportersPanel palette={palette} />);

    // "codes" is the default, and it has no brand key to name.
    expect(screen.queryByLabelText("export.brandKey")).not.toBeInTheDocument();

    await chooseExport("Chakra v3");
    await waitFor(() =>
      expect(screen.getByLabelText("export.brandKey")).toBeInTheDocument()
    );
  });
});

describe("ExportersPanel copying", () => {
  it("copies what is on screen, not a stale render", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ExportersPanel palette={palette} />);
    await userEvent.click(screen.getByRole("button", { name: "RGB" }));
    await waitFor(() => expect(lines()[0]).toMatch(/^rgb\(/));

    const panel = screen.getByRole("code").closest("div")!;
    await userEvent.click(within(panel).getByRole("button"));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toBe(code().textContent);
  });
});
