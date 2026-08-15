import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SavedPalette } from "@/hooks/use-saved-palettes";
import { SavedPalettes } from "./saved-palettes";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/features/playground/playground-drawer", () => ({
  PlaygroundDrawer: () => <div data-testid="playground" />,
}));

function makePalette(id: string, name: string, base: string): SavedPalette {
  return {
    id,
    name,
    baseHex: base,
    shades: {
      50: "#EBF8FF",
      100: "#BEE3F8",
      200: "#90CDF4",
      300: "#63B3ED",
      400: "#4299E1",
      500: base,
      600: "#2B6CB0",
      700: "#2C5282",
      800: "#2A4365",
      900: "#1A365D",
      950: "#102A4C",
    },
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

const ocean = makePalette("ocean", "Ocean", "#3182CE");
const ember = makePalette("ember", "Ember", "#E53E3E");

describe("SavedPalettes", () => {
  it("says so when there is nothing saved", () => {
    render(<SavedPalettes saved={[]} onLoad={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("saved.empty")).toBeInTheDocument();
    expect(screen.queryByText("saved.load")).not.toBeInTheDocument();
  });

  it("renders one card per palette", () => {
    render(
      <SavedPalettes saved={[ocean, ember]} onLoad={vi.fn()} onDelete={vi.fn()} />
    );

    expect(screen.getByText("Ocean")).toBeInTheDocument();
    expect(screen.getByText("Ember")).toBeInTheDocument();
    expect(screen.getAllByText("saved.load")).toHaveLength(2);
  });

  it("shows all eleven stops of each palette", () => {
    render(<SavedPalettes saved={[ocean]} onLoad={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getAllByLabelText(/^shade \d+: #/)).toHaveLength(11);
    expect(screen.getByLabelText("shade 500: #3182CE")).toBeInTheDocument();
  });

  it("hands the whole palette back on load, not just its id", async () => {
    const onLoad = vi.fn();
    render(
      <SavedPalettes saved={[ocean, ember]} onLoad={onLoad} onDelete={vi.fn()} />
    );

    await userEvent.click(screen.getAllByText("saved.load")[1]);

    // The generator needs baseHex and name to repopulate the form, so an id
    // alone would silently break loading.
    expect(onLoad).toHaveBeenCalledWith(ember);
  });

  it("deletes by id", async () => {
    const onDelete = vi.fn();
    render(
      <SavedPalettes saved={[ocean, ember]} onLoad={vi.fn()} onDelete={onDelete} />
    );

    await userEvent.click(screen.getAllByLabelText("saved.delete")[0]);

    expect(onDelete).toHaveBeenCalledWith("ocean");
  });

  it("gives the delete button a name, since it is icon-only", () => {
    render(<SavedPalettes saved={[ocean]} onLoad={vi.fn()} onDelete={vi.fn()} />);

    // A trash icon with no accessible name is unreachable by screen reader,
    // and there is no text fallback on this button.
    expect(
      screen.getByRole("button", { name: "saved.delete" })
    ).toBeInTheDocument();
  });
});
