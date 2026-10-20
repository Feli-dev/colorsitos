import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Navbar from "./navbar";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Navbar", () => {
  it("paints a translucent, blurred background so scrolled content does not show through", () => {
    render(<Navbar />);

    const nav = screen.getByRole("navigation");

    // jsdom has no layout or backdrop-filter, so the contract is the classes:
    // a theme-aware (token-based, so light and dark both work) background plus
    // a backdrop blur.
    expect(nav).toHaveClass("bg-background/80");
    expect(nav).toHaveClass("backdrop-blur");
  });
});
