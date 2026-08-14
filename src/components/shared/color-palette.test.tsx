import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColorPalette } from "@/types/colors";
import { ColorPaletteComponent } from "@/components/shared/color-palette";

// next-intl needs a provider; this component only reads copy-button labels.
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const palette: ColorPalette = {
  id: "brand",
  name: "Brand",
  shades: [
    { value: 50, hex: "#EBF8FF", name: "brand-50" },
    { value: 500, hex: "#3182CE", name: "brand-500" },
    { value: 950, hex: "#102A4C", name: "brand-950" },
  ],
};

describe("ColorPaletteComponent", () => {
  it("renders the title as a heading when one is given", () => {
    render(<ColorPaletteComponent palette={palette} title="Generated" />);

    expect(
      screen.getByRole("heading", { name: "Generated" })
    ).toBeInTheDocument();
  });

  it("renders no heading when the title is omitted", () => {
    render(<ColorPaletteComponent palette={palette} />);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders no heading for an empty title", () => {
    render(<ColorPaletteComponent palette={palette} title="" />);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders one swatch per shade regardless of the title", () => {
    const { unmount } = render(<ColorPaletteComponent palette={palette} />);
    expect(screen.getAllByRole("button", { name: /^\d+ #/ })).toHaveLength(3);
    unmount();

    render(<ColorPaletteComponent palette={palette} title="Generated" />);
    expect(screen.getAllByRole("button", { name: /^\d+ #/ })).toHaveLength(3);
  });

  it("labels each swatch with its stop and hex", () => {
    render(<ColorPaletteComponent palette={palette} />);

    expect(
      screen.getByRole("button", { name: "500 #3182CE" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "950 #102A4C" })
    ).toBeInTheDocument();
  });

  it("shows each shade's hex as text", () => {
    render(<ColorPaletteComponent palette={palette} />);

    for (const shade of palette.shades) {
      expect(screen.getByText(shade.hex)).toBeInTheDocument();
    }
  });

  it("renders an empty palette without a swatch", () => {
    render(
      <ColorPaletteComponent
        palette={{ id: "empty", name: "Empty", shades: [] }}
        title="Generated"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Generated" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^\d+ #/ })
    ).not.toBeInTheDocument();
  });
});
