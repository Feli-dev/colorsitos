import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SupportButton } from "./support-button";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("SupportButton", () => {
  it("renders no heading at all", () => {
    // The label lives inside a <button>. It names a control, which is not what
    // a heading is for — and as an <h1> it gave the page a second top-level
    // heading, breaking document outline navigation.
    render(<SupportButton />);

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("still exposes the control with an accessible name", () => {
    render(<SupportButton />);

    expect(
      screen.getByRole("button", { name: "support.ariaLabel" })
    ).toBeInTheDocument();
  });

  it("keeps the label visible", () => {
    render(<SupportButton />);

    expect(screen.getByText("support.title")).toBeInTheDocument();
  });
});
