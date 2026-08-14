import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its children inside a span tagged with the badge slot", () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText("New");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-slot", "badge");
  });

  it("applies the default variant when none is given", () => {
    render(<Badge>Default</Badge>);

    expect(screen.getByText("Default")).toHaveClass("bg-primary");
  });

  it("applies the requested variant", () => {
    render(<Badge variant="destructive">Danger</Badge>);

    expect(screen.getByText("Danger")).toHaveClass("bg-destructive");
  });

  it("merges caller class names over the variant defaults", () => {
    render(<Badge className="rounded-full">Rounded</Badge>);

    const badge = screen.getByText("Rounded");
    expect(badge).toHaveClass("rounded-full");
    expect(badge).not.toHaveClass("rounded-md");
  });

  it("renders the child element instead of a span with asChild", () => {
    render(
      <Badge asChild>
        <a href="/palettes">Palettes</a>
      </Badge>
    );

    const link = screen.getByRole("link", { name: "Palettes" });
    expect(link).toHaveAttribute("data-slot", "badge");
    expect(link).toHaveClass("inline-flex");
  });

  it("forwards arbitrary span props", () => {
    render(<Badge aria-label="status badge">Live</Badge>);

    expect(screen.getByLabelText("status badge")).toBeInTheDocument();
  });
});
