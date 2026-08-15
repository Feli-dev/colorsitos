import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { ColorPalette } from "@/types/colors";
import { ColorShowcase } from "./color-showcase";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
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

const SECTIONS = [
  "showcase.buttons.title",
  "showcase.cards.title",
  "showcase.forms.title",
  "showcase.misc.title",
  "showcase.guide.title",
];

describe("ColorShowcase", () => {
  it("renders every section", () => {
    render(<ColorShowcase palette={palette} />);

    for (const key of SECTIONS) {
      expect(screen.getByRole("heading", { name: key })).toBeInTheDocument();
    }
  });

  it("renders each section exactly once", () => {
    render(<ColorShowcase palette={palette} />);

    // Guards the split: a copy-paste while extracting would show up here.
    for (const key of SECTIONS) {
      expect(screen.getAllByRole("heading", { name: key })).toHaveLength(1);
    }
  });

  it("survives a palette missing stops", () => {
    // shades are looked up by value, so a short palette must not throw.
    const sparse: ColorPalette = {
      id: "sparse",
      name: "Sparse",
      shades: [{ value: 500, hex: "#3182CE", name: "sparse-500" }],
    };

    expect(() => render(<ColorShowcase palette={sparse} />)).not.toThrow();
  });

  it("survives an empty palette", () => {
    expect(() =>
      render(
        <ColorShowcase palette={{ id: "e", name: "Empty", shades: [] }} />
      )
    ).not.toThrow();
  });

  it("renders the form controls the sections own", () => {
    render(<ColorShowcase palette={palette} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("switch")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
