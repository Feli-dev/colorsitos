import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "./page";

vi.mock("@/features/hero/hero", () => ({ default: () => <div /> }));
vi.mock("@/features/hero/color-square-display", () => ({
  ColorSquareDisplay: () => <div />,
}));
vi.mock("@/features/palette-generator/palette-generator", () => ({
  PaletteGenerator: () => <div data-testid="generator" />,
}));

describe("Home layout", () => {
  it("lets the generator's wrapper span the column", () => {
    // Under `items-center` an unclassed wrapper shrinks to its content, so the
    // generator's own `w-full` resolved against content width and the card
    // pushed past the viewport on narrow screens (~13px of horizontal scroll
    // at 390px). The wrapper must be `w-full` for the width to be bounded.
    render(<Home />);

    expect(screen.getByTestId("generator").parentElement).toHaveClass("w-full");
  });
});
